import {globalFields, getGlobalField, setGlobalField} from "#src/modules/localStorage.mts";

let allowedDomains: Set<string> = new Set();

export async function init() {
    const stored: string[] = getGlobalField(globalFields.Security.AllowedDomains) ?? [];
    allowedDomains = new Set(stored);
}

export function isAllowed(domain: string): boolean {
    return allowedDomains.has(domain);
}

export async function greenlightDomain(domain: string) {
    allowedDomains.add(domain);
    await setGlobalField(globalFields.Security.AllowedDomains, [...allowedDomains]);
}
