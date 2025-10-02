export type TyposquatResult = {
    risk: "none" | "low" | "medium" | "high";
    reason?: string;
};
export declare function checkTyposquat(name: string, popularList: string[]): TyposquatResult;
export declare const defaultPopular: string[];
