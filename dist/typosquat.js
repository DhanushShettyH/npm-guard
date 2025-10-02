import leven from "leven";
export function checkTyposquat(name, popularList) {
    const lower = name.toLowerCase();
    // Check for case-variant impersonation
    const caseVariant = popularList.find((p) => p.toLowerCase() === lower && p !== name);
    if (caseVariant) {
        return {
            risk: "high",
            reason: `Case-variant impersonation possible against ${caseVariant}`,
        };
    }
    // Check Levenshtein distance
    let minDist = Infinity;
    let closest = "";
    for (const popular of popularList) {
        const dist = leven(lower, popular.toLowerCase());
        if (dist < minDist && dist > 0) {
            minDist = dist;
            closest = popular;
        }
    }
    if (minDist === 0)
        return { risk: "none" };
    if (minDist === 1)
        return { risk: "high", reason: `Very similar to ${closest}` };
    if (minDist === 2)
        return { risk: "medium", reason: `Similar to ${closest}` };
    if (minDist === 3)
        return { risk: "low", reason: `Somewhat similar to ${closest}` };
    return { risk: "none" };
}
// Top packages to check against (expandable)
export const defaultPopular = [
    "react",
    "react-dom",
    "lodash",
    "express",
    "debug",
    "chalk",
    "axios",
    "moment",
    "typescript",
    "eslint",
    "webpack",
    "prettier",
    "jest",
    "rxjs",
    "next",
    "vue",
    "svelte",
    "angular",
    "vite",
    "node-fetch",
    "commander",
    "inquirer",
    "dotenv",
    "uuid",
    "jsonwebtoken",
    "bcrypt",
    "mongoose",
    "body-parser",
    "cors",
    "helmet",
];
