console.log("Program started");

import "#src/envloader.mts";
import logs from "#src/core/logs.mts";

import clientModule from "#src/core/client.mts";
import discordModule from "#src/core/discord.mts";
import commandRegistryModule from "#src/commandRegistry.mts";
import eventInitModule from "#src/events/eventInit.mts";
import localStorageModule from "#src/modules/localStorage.mts";
import {MaybePromise} from "#src/util/utilityTypes.mts";
import chalk from "chalk";

const t0 = { start: 0 };
function ms() { return Date.now() - t0.start; }

interface CoreModule<Dep = void, Res = void> {
    init: (dependency: Dep) => Promise<Res>;
    name: () => string;
}

async function load<Dep, Res>(
    module: CoreModule<Dep, Res>,
    dependency: MaybePromise<Dep>
): Promise<Res>;

async function load<Dep extends void | undefined, Res>(
    module: CoreModule<Dep, Res>
): Promise<Res>;

async function load<Dep, Res>(
    module: CoreModule<Dep, Res>,
    ...args: unknown[]
): Promise<Res> {
    const dependency = args[0] as MaybePromise<Dep>;
    const loadedDependency = await dependency;

    const result = await module.init(loadedDependency);

    console.log(chalk.gray(`Module ${module.name()} loaded in ${ms()}ms`));
    return result;
}

async function init() {
    t0.start = Date.now();

    const localStoragePromise = load(localStorageModule);
    const clientPromise = load(clientModule);
    const commandRegistryPromise = load(commandRegistryModule, clientPromise);
    const discordModulePromise = load(discordModule, clientPromise);
    const eventInitPromise = load(eventInitModule, clientPromise);

    await Promise.all([
        localStoragePromise,
        commandRegistryPromise,
        discordModulePromise,
        eventInitPromise,
    ])
}

process.on('uncaughtException', (error) => { // Error logging
    try {
        void logs.logError("running (uncaught)", error);
    } catch (caught) {
        console.error("Uncaught exception could not be logged in Discord channel:", caught)
    }
});

console.log("Finished imports, starting automatic tasks");
await init();