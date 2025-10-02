import fs from "node:fs";
import path from "node:path";
import ora from "ora";
import { fetchDeprecatedMessage, fetchVersionPublishTime, fetchWeeklyDownloads, } from "./registry.js";
import { runNpmAuditJson, summarizeAudit } from "./audit.js";
import { checkTyposquat, defaultPopular } from "./typosquat.js";
import { computeScore } from "./score.js";
function loadPackageJson(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath)) {
        throw new Error("No package.json found in current directory");
    }
    return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
}
function loadLockfile(cwd) {
    const lockPath = path.join(cwd, "package-lock.json");
    if (!fs.existsSync(lockPath)) {
        // Try other lockfiles
        const yarnLock = path.join(cwd, "yarn.lock");
        const pnpmLock = path.join(cwd, "pnpm-lock.yaml");
        if (fs.existsSync(yarnLock) || fs.existsSync(pnpmLock)) {
            console.warn("⚠️  Found yarn.lock or pnpm-lock.yaml. Currently only npm lockfiles are supported.");
        }
        return {};
    }
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf-8"));
    const out = {};
    function walk(deps, prefix = "") {
        if (!deps)
            return;
        for (const [key, value] of Object.entries(deps)) {
            if (value.version) {
                const name = key.startsWith("node_modules/")
                    ? key.replace("node_modules/", "")
                    : key;
                out[name] = value.version;
            }
            if (value.dependencies) {
                walk(value.dependencies, `${prefix}${key}/`);
            }
        }
    }
    // npm v7+ uses packages field
    if (lock.packages) {
        walk(lock.packages);
    }
    else if (lock.dependencies) {
        // npm v6 format
        walk(lock.dependencies);
    }
    return out;
}
export async function scan(cwd = process.cwd()) {
    const spinner = ora("Loading package information...").start();
    try {
        const pkg = loadPackageJson(cwd);
        const lock = loadLockfile(cwd);
        const deps = {
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {}),
        };
        const names = Object.keys(deps);
        if (names.length === 0) {
            spinner.fail("No dependencies found");
            return {
                findings: [],
                totalScore: 100,
                summary: {
                    deprecated: 0,
                    typosquatRisks: 0,
                    cooldownRecent: 0,
                    vulns: { critical: 0, high: 0, moderate: 0, low: 0, total: 0 },
                },
                errors: [],
            };
        }
        spinner.text = "Running npm audit...";
        const auditJson = await runNpmAuditJson();
        const auditSummary = summarizeAudit(auditJson);
        const findings = [];
        const errors = [];
        spinner.text = `Analyzing ${names.length} dependencies...`;
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            spinner.text = `Analyzing (${i + 1}/${names.length}): ${name}`;
            const version = lock[name] || deps[name] || "latest";
            // Fetch all data in parallel
            const [depMsg, downloads, publishTime] = await Promise.allSettled([
                fetchDeprecatedMessage(name, version),
                fetchWeeklyDownloads(name),
                fetchVersionPublishTime(name, version),
            ]);
            const deprecatedMsg = depMsg.status === "fulfilled" ? depMsg.value : undefined;
            const weeklyDownloads = downloads.status === "fulfilled" ? downloads.value : undefined;
            let lastPublishDays;
            let publishedHoursAgo;
            if (publishTime.status === "fulfilled" && publishTime.value) {
                const ms = Date.now() - publishTime.value.getTime();
                lastPublishDays = Math.floor(ms / (1000 * 60 * 60 * 24));
                publishedHoursAgo = Math.floor(ms / (1000 * 60 * 60));
            }
            const cooldown = publishedHoursAgo !== undefined && publishedHoursAgo < 72;
            const typos = checkTyposquat(name, defaultPopular);
            const packageVulns = {
                critical: 0,
                high: 0,
                moderate: 0,
                low: 0,
            };
            // Try to extract package-specific vulnerabilities if available
            if (auditJson?.vulnerabilities?.[name]) {
                const pkgAudit = auditJson.vulnerabilities[name];
                Object.values(pkgAudit).forEach((adv) => {
                    if (adv.severity === "critical")
                        packageVulns.critical++;
                    if (adv.severity === "high")
                        packageVulns.high++;
                    if (adv.severity === "moderate")
                        packageVulns.moderate++;
                    if (adv.severity === "low")
                        packageVulns.low++;
                });
            }
            const score = computeScore({
                deprecated: !!deprecatedMsg,
                lastPublishDays,
                downloads: weeklyDownloads,
                vulns: packageVulns,
                typosquatRisk: typos.risk,
                cooldownRecent: cooldown,
            });
            const advice = [];
            if (deprecatedMsg) {
                advice.push(`Deprecated: ${deprecatedMsg}`);
            }
            if (typos.risk !== "none" && typos.reason) {
                advice.push(`Typosquat risk: ${typos.reason}`);
            }
            if (cooldown) {
                advice.push(`Recently published (<72h ago). Consider waiting before adoption.`);
            }
            if ((weeklyDownloads ?? 0) < 100) {
                advice.push(`Low popularity. Verify maintainer trust and code quality.`);
            }
            if (lastPublishDays && lastPublishDays > 730) {
                advice.push(`Not updated in ${Math.floor(lastPublishDays / 365)} years. May be unmaintained.`);
            }
            findings.push({
                name,
                version: String(version),
                deprecated: deprecatedMsg ? { message: deprecatedMsg } : undefined,
                lastPublishDays,
                weeklyDownloads,
                audit: {
                    total: packageVulns.critical +
                        packageVulns.high +
                        packageVulns.moderate +
                        packageVulns.low,
                    critical: packageVulns.critical,
                    high: packageVulns.high,
                    moderate: packageVulns.moderate,
                    low: packageVulns.low,
                },
                typosquat: typos,
                cooldown: { recent: cooldown, publishedHoursAgo },
                score,
                advice,
            });
        }
        const totalScore = Math.round(findings.reduce((sum, f) => sum + f.score, 0) /
            Math.max(1, findings.length));
        const summary = {
            deprecated: findings.filter((f) => f.deprecated).length,
            typosquatRisks: findings.filter((f) => f.typosquat && f.typosquat.risk !== "none").length,
            cooldownRecent: findings.filter((f) => f.cooldown?.recent).length,
            vulns: auditSummary,
        };
        spinner.succeed("Analysis complete");
        return { findings, totalScore, summary, errors };
    }
    catch (error) {
        spinner.fail("Analysis failed");
        throw error;
    }
}
