export declare function runNpmAuditJson(): Promise<any | undefined>;
export declare function summarizeAudit(auditJson: any): {
    total: any;
    critical: any;
    high: any;
    moderate: any;
    low: any;
};
