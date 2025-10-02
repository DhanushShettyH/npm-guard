import { spawn } from "node:child_process";
import { promisify } from "node:util";
const execAsync = promisify(spawn);
export async function runNpmAuditJson() {
    return new Promise((resolve) => {
        const proc = spawn("npm", ["audit", "--json"], {
            stdio: ["ignore", "pipe", "pipe"],
            shell: process.platform === "win32",
        });
        let out = "";
        let err = "";
        proc.stdout.on("data", (data) => (out += data));
        proc.stderr.on("data", (data) => (err += data));
        proc.on("close", (code) => {
            try {
                const result = JSON.parse(out);
                resolve(result);
            }
            catch {
                // npm audit exits non-zero when vulnerabilities exist
                // but still outputs valid JSON
                resolve(undefined);
            }
        });
        proc.on("error", () => {
            resolve(undefined);
        });
    });
}
export function summarizeAudit(auditJson) {
    if (!auditJson?.metadata?.vulnerabilities) {
        return { total: 0, critical: 0, high: 0, moderate: 0, low: 0 };
    }
    const v = auditJson.metadata.vulnerabilities;
    return {
        total: (v.critical || 0) + (v.high || 0) + (v.moderate || 0) + (v.low || 0),
        critical: v.critical || 0,
        high: v.high || 0,
        moderate: v.moderate || 0,
        low: v.low || 0,
    };
}
