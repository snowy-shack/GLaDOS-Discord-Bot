# Startup benchmark

When you run `npm run debug` or `npm run start`, the bot prints `[bench]` lines so you can see where time is spent.

## What is measured

- **localStorage.init** – Time to first benchmark line (global storage only; no user files loaded).
- **client.init** – Cumulative time including Discord login.
- **discord + loadCommands (parallel)** – Guild fetch + loading all command modules, run in parallel.
- **registerSlashCommands** – Pushing slash command definitions to Discord API.
- **eventInit** – Registering event handlers and running ready tasks (including scam URL refresh in background).
- **TOTAL STARTUP (to Ready)** – Time from start of `init()` until the bot is “Ready”.

## Optimizations applied

| Change | Effect |
|--------|--------|
| **Discord channels/members/roles** | Fetched in background (non-blocking). `discord.init()` returns as soon as the guild is fetched; cache fills asynchronously. |
| **Per-user localStorage** | Only global storage is loaded at startup. User data is loaded on first access (lazy). |
| **Command loading** | No top-level await; commands load inside `init()` in parallel with `discord.init()`. |
| **Scam URL refresh** | No longer awaited before “Ready”; runs in background. |
| **Version** | `getVersion()` result is cached after first read. |
| **Command list** | `getCommandList()` result is cached so the filesystem is not read on every interaction. |

## How to compare

1. Run `npm run debug` (or `npm run start`) with a valid `TOKEN` in `beta.env` / `prod.env`.
2. Note the **TOTAL STARTUP (to Ready)** value.
3. Typical improvements after these changes:
   - **Before:** Startup blocked on `await phantys_home.channels.fetch()` + `members.fetch()` + loading every user JSON file.
   - **After:** Startup only waits for guild fetch, global storage, client login, command loading (in parallel with guild), and event registration. User files and full channel/member cache load on demand or in background.

## Example output

```
index.mts running
Finished imports, starting automatic tasks
  [bench] localStorage.init: 12ms
  [bench] client.init: 1843ms
  [bench] discord + loadCommands (parallel): 3124ms
  [bench] registerSlashCommands: 3456ms
  [bench] eventInit: 3489ms
  [bench] TOTAL STARTUP (to Ready): 3489ms
```

Your numbers will vary with network and guild size. The important comparison is your own “before vs after” if you ever revert the optimizations.
