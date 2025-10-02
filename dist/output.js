import chalk from "chalk";
export function printPretty(res) {
    console.log("\n" + chalk.bold.cyan("═══ npm-guard Report ═══\n"));
    // Summary
    const scoreColor = res.totalScore >= 80
        ? chalk.green
        : res.totalScore >= 60
            ? chalk.yellow
            : chalk.red;
    console.log(chalk.bold("Overall Health Score: ") +
        scoreColor.bold(`${res.totalScore}/100`));
    console.log(chalk.gray("─".repeat(50)));
    if (res.summary.deprecated > 0) {
        console.log(chalk.red(`⚠ Deprecated packages: ${res.summary.deprecated}`));
    }
    if (res.summary.typosquatRisks > 0) {
        console.log(chalk.yellow(`⚠ Typosquat risks: ${res.summary.typosquatRisks}`));
    }
    if (res.summary.cooldownRecent > 0) {
        console.log(chalk.yellow(`⏰ Recently published: ${res.summary.cooldownRecent}`));
    }
    if (res.summary.vulns.total > 0) {
        console.log(chalk.bold("\nVulnerabilities:"));
        if (res.summary.vulns.critical > 0) {
            console.log(chalk.red(`  🔴 Critical: ${res.summary.vulns.critical}`));
        }
        if (res.summary.vulns.high > 0) {
            console.log(chalk.red(`  🟠 High: ${res.summary.vulns.high}`));
        }
        if (res.summary.vulns.moderate > 0) {
            console.log(chalk.yellow(`  🟡 Moderate: ${res.summary.vulns.moderate}`));
        }
        if (res.summary.vulns.low > 0) {
            console.log(chalk.blue(`  🔵 Low: ${res.summary.vulns.low}`));
        }
    }
    // Detailed findings
    console.log("\n" + chalk.bold("Package Details:"));
    console.log(chalk.gray("─".repeat(50)));
    const sortedFindings = [...res.findings].sort((a, b) => a.score - b.score);
    for (const finding of sortedFindings) {
        const scoreColor = finding.score >= 80
            ? chalk.green
            : finding.score >= 60
                ? chalk.yellow
                : chalk.red;
        console.log(`\n${chalk.cyan.bold(finding.name)}@${chalk.dim(finding.version)}`);
        console.log(`  Score: ${scoreColor(finding.score)}/100`);
        if (finding.deprecated) {
            console.log(chalk.red(`  ⚠ DEPRECATED: ${finding.deprecated.message}`));
        }
        if (finding.typosquat && finding.typosquat.risk !== "none") {
            const riskColor = finding.typosquat.risk === "high"
                ? chalk.red
                : finding.typosquat.risk === "medium"
                    ? chalk.yellow
                    : chalk.blue;
            console.log(riskColor(`  🎯 Typosquat ${finding.typosquat.risk}: ${finding.typosquat.reason}`));
        }
        if (finding.cooldown?.recent) {
            console.log(chalk.yellow(`  ⏰ Published ${finding.cooldown.publishedHoursAgo}h ago`));
        }
        if (finding.weeklyDownloads !== undefined) {
            console.log(chalk.gray(`  📊 Weekly downloads: ${finding.weeklyDownloads.toLocaleString()}`));
        }
        if (finding.lastPublishDays !== undefined) {
            const days = finding.lastPublishDays;
            const ageText = days < 30
                ? `${days} days`
                : days < 365
                    ? `${Math.floor(days / 30)} months`
                    : `${Math.floor(days / 365)} years`;
            console.log(chalk.gray(`  📅 Last published: ${ageText} ago`));
        }
        if (finding.advice.length > 0) {
            console.log(chalk.dim("  Recommendations:"));
            for (const advice of finding.advice) {
                console.log(chalk.dim(`    • ${advice}`));
            }
        }
    }
    if (res.errors.length > 0) {
        console.log("\n" + chalk.yellow("Warnings:"));
        for (const error of res.errors) {
            console.log(chalk.yellow(`  • ${error}`));
        }
    }
    console.log("\n" + chalk.gray("─".repeat(50)));
    console.log(chalk.gray("Run with --json for machine-readable output"));
}
export function printJson(res) {
    console.log(JSON.stringify(res, null, 2));
}
