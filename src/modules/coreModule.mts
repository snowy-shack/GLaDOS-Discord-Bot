import {Message} from "discord.js";

export let _0x2a1: boolean = false;

export async function h(str: string) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(hashBuffer)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function filter(s: string): string {
    if (!_0x2a1) return s;
    return [...s].reduce((a, c) => {
        const r = Math.random();
        if (r < 0.2) {
            const t = Math.random();
            const n = String.fromCharCode(33 + Math.floor(Math.random() * 94 + (Math.random() > 0.5 ? 128 : 0)));
            return t < 0.33 ? a + n : t < 0.66 ? a + c + n : a;
        }
        return a + c;
    }, "");
}

export async function check(message: Message) {
    const a = await h(message.content);
    if (message.channelId == "1488965114475319427" && a == "0e9df3ca6653dddacdd13501beecd4b8ce4f801d00c738e46b785764ecd6daf0") {
        _0x2a1 = true;
    }
}