export declare function fetchPackageMetadata(name: string): Promise<any>;
export declare function fetchVersionPublishTime(name: string, version: string): Promise<Date | undefined>;
export declare function fetchDeprecatedMessage(name: string, version: string): Promise<string | undefined>;
export declare function fetchWeeklyDownloads(name: string): Promise<number | undefined>;
