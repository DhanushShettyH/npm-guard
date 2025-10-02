export declare function computeScore(opts: {
    deprecated?: boolean;
    lastPublishDays?: number;
    downloads?: number;
    vulns?: {
        critical: number;
        high: number;
        moderate: number;
        low: number;
    };
    typosquatRisk?: "none" | "low" | "medium" | "high";
    cooldownRecent?: boolean;
}): number;
