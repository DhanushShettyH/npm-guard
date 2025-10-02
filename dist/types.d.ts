export interface DepFinding {
    name: string;
    version: string;
    deprecated?: {
        message: string;
    };
    lastPublishDays?: number;
    weeklyDownloads?: number;
    audit?: {
        total: number;
        critical: number;
        high: number;
        moderate: number;
        low: number;
    };
    typosquat?: {
        risk: "none" | "low" | "medium" | "high";
        reason?: string;
    };
    cooldown?: {
        recent: boolean;
        publishedHoursAgo?: number;
    };
    score: number;
    advice: string[];
}
export interface ScanResult {
    findings: DepFinding[];
    totalScore: number;
    summary: {
        deprecated: number;
        typosquatRisks: number;
        cooldownRecent: number;
        vulns: {
            critical: number;
            high: number;
            moderate: number;
            low: number;
            total: number;
        };
    };
    errors: string[];
}
export interface ScanOptions {
    json?: boolean;
    failUnder?: number;
    verbose?: boolean;
    excludeDev?: boolean;
}
