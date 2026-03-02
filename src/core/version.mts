import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let versionCache: string | null = null;

/** Single source of truth: package.json version (semver). */
export function getVersionSync(): string {
    if (versionCache !== null) return versionCache;
    const pkgPath = path.join(__dirname, "../../package.json");
    const data = readFileSync(pkgPath, "utf8");
    const parsed = JSON.parse(data) as { version?: string };
    versionCache = typeof parsed.version === "string" ? parsed.version : "0.0.0";
    return versionCache;
}

export async function getVersion(): Promise<string> {
    return getVersionSync();
}
