export function computeScore(opts) {
    let score = 100;
    // Major penalties
    if (opts.deprecated)
        score -= 40;
    // Vulnerability penalties
    if (opts.vulns) {
        score -= opts.vulns.critical * 10;
        score -= opts.vulns.high * 5;
        score -= Math.min(10, opts.vulns.moderate * 2);
        score -= Math.min(5, opts.vulns.low);
    }
    // Maintenance penalties
    if (opts.lastPublishDays !== undefined) {
        if (opts.lastPublishDays > 730)
            score -= 10; // > 2 years stale
        else if (opts.lastPublishDays > 365)
            score -= 5; // > 1 year
    }
    // Popularity penalties
    if (opts.downloads !== undefined) {
        if (opts.downloads < 100)
            score -= 10;
        else if (opts.downloads < 1000)
            score -= 5;
    }
    // Typosquat risk penalties
    switch (opts.typosquatRisk) {
        case "high":
            score -= 20;
            break;
        case "medium":
            score -= 10;
            break;
        case "low":
            score -= 5;
            break;
    }
    // Cooldown penalty
    if (opts.cooldownRecent)
        score -= 5;
    return Math.max(0, Math.min(100, score));
}
