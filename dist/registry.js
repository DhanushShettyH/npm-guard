import { request } from "undici";
const NPM_REGISTRY = "https://registry.npmjs.org";
const NPM_DOWNLOADS = "https://api.npmjs.org/downloads/point/last-week";
export async function fetchPackageMetadata(name) {
    try {
        const res = await request(`${NPM_REGISTRY}/${encodeURIComponent(name)}`, {
            method: "GET",
            headers: { Accept: "application/json" },
        });
        if (res.statusCode !== 200) {
            throw new Error(`Registry fetch failed for ${name}: ${res.statusCode}`);
        }
        return await res.body.json();
    }
    catch (error) {
        throw new Error(`Failed to fetch metadata for ${name}: ${error}`);
    }
}
export async function fetchVersionPublishTime(name, version) {
    const meta = await fetchPackageMetadata(name);
    const cleanVersion = version.replace(/^[^\d]*/, "");
    const time = meta.time?.[cleanVersion];
    return time ? new Date(time) : undefined;
}
export async function fetchDeprecatedMessage(name, version) {
    const meta = await fetchPackageMetadata(name);
    const cleanVersion = version.replace(/^[^\d]*/, "");
    const manifest = meta.versions?.[cleanVersion];
    return manifest?.deprecated;
}
export async function fetchWeeklyDownloads(name) {
    try {
        const res = await request(`${NPM_DOWNLOADS}/${encodeURIComponent(name)}`);
        if (res.statusCode !== 200)
            return undefined;
        const json = (await res.body.json());
        return typeof json.downloads === "number" ? json.downloads : undefined;
    }
    catch {
        return undefined;
    }
}
