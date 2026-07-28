import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const args = process.argv.slice(2);
const isBeta = args.includes('--beta') || args.includes('-b');
const envFile = isBeta ? 'beta.env' : 'prod.env';

async function getWebhookUrl() {
    try {
        const content = await readFile(path.join(ROOT, envFile), 'utf-8');
        for (const line of content.split('\n')) {
            const eq = line.indexOf('=');
            if (eq === -1) continue;
            if (line.slice(0, eq).trim() === 'WEBHOOK') return line.slice(eq + 1).trim();
        }
    } catch {}
    return process.env.WEBHOOK ?? null;
}

async function sendWebhook(url, content) {
    if (!url) return;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Central Core', content }),
        });
    } catch (e) {
        console.error('[crash-monitor] Failed to send crash notification:', e.message);
    }
}

const webhookUrl = await getWebhookUrl();

const child = spawn('node', [
    '--loader', 'ts-node/esm',
    '--require', 'tsconfig-paths/register',
    '--experimental-specifier-resolution=node',
    'src/index.mts',
    ...args,
], {
    cwd: ROOT,
    stdio: 'inherit',
});

child.on('exit', async (code, signal) => {
    if (signal) {
        // Signal-based termination — likely a C-level crash (SIGSEGV, SIGABRT, etc.)
        await sendWebhook(webhookUrl, `💥 **GLaDOS crashed** — killed by signal \`${signal}\`. Check server logs for details.`);
    } else if (code !== 0 && code !== null) {
        await sendWebhook(webhookUrl, `💥 **GLaDOS exited unexpectedly** — exit code \`${code}\`. Check server logs for details.`);
    }
    process.exit(code ?? 1);
});

// Forward SIGINT/SIGTERM to the child so it can shut down cleanly
for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => child.kill(sig));
}
