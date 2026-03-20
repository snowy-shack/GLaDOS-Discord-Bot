import {ChatInputCommandInteraction, Client, PermissionFlagsBits, REST, Routes, SharedSlashCommand} from "discord.js";
import {guildID} from "#src/core/phantys_home.mts";
import chalk from "chalk";

export interface CommandModule {
    init: () => SharedSlashCommand | Promise<SharedSlashCommand>;
    react: (interaction: ChatInputCommandInteraction) => Promise<void>;
    name: string;
}

// Command imports
import * as ping from "#src/commands/ping.mts";
import * as about from "#src/commands/about.mts";
import * as apply_jumpsuit from "#src/commands/apply_jumpsuit.mts";
import * as birthday from "#src/commands/birthday.mts";
import * as faq from "#src/commands/faq.mts";
import * as rule from "#src/commands/rule.mts";
import * as wordle from "#src/commands/wordle.mts";

import * as babble from "#src/commands/developer/babble.mts";
import * as skins from "#src/commands/developer/skins.mts";

import * as manage from "#src/commands/moderator/manage.mts";
import * as storage from "#src/commands/moderator/storage.mts";

import * as reboot from "#src/commands/admin/reboot.mts";
import * as refresh from "#src/commands/admin/refresh.mts";
import * as update from "#src/commands/admin/update.mts";
import * as utils from "#src/commands/admin/utils.mts";

export type commandCategory = 'global' | 'moderator' | 'developer' | 'admin';
export const commandRegistry: Record<commandCategory, { [key: string]: CommandModule }> = {
    global: {
        ping: ping,
        about: about,
        apply_jumpsuit: apply_jumpsuit,
        birthday: birthday,
        faq: faq,
        rule: rule,
        wordle: wordle,
    },
    moderator: {
        manage: manage,
        storage: storage,
    },
    developer: {
        babble: babble,
        skins: skins,
    },
    admin: {
        reboot: reboot,
        refresh: refresh,
        update: update,
        utils: utils,
    }
}

export const commandsList: CommandModule[] = Object.values(commandRegistry)
    .flatMap(category => Object.values(category));

const categoryPermissions: Record<commandCategory, BigInt | null> = {
    global: null, // Publicly available
    moderator: PermissionFlagsBits.KickMembers,
    developer: PermissionFlagsBits.MoveMembers,
    admin: PermissionFlagsBits.Administrator,
};

const commandsToRegister = await Promise.all(
    Object.entries(commandRegistry).flatMap(([category, commands]) =>
        Object.values(commands).map(async (module) => {
            const builder = await module.init();
            const permission = categoryPermissions[category as commandCategory];

            if (permission !== null) {
                builder.setDefaultMemberPermissions(permission.valueOf());
            }

            return builder.toJSON();
        })
    )
);

// // Define the commands
// let commandList = getCommandList();
//
// const commands = await Promise.all(
//     commandList.map(async commandName => {
//         const { init }: CommandModule = await import(`#src/commands/${commandName}`);
//         let initialization = await init();
//
//         return initialization.toJSON();
//     })
// );

/**
 * @throws Error if commands could not properly be registered
 */
export async function init(client: Client) {
    if (!process.env.TOKEN) throw new Error('App TOKEN was not set properly');

    const appID = client.application?.id;
    if (!appID) throw new Error('Client app ID was not initialised properly');

    const rest = new REST().setToken(process.env.TOKEN);

    console.log(chalk.gray(`Registering ${commandsToRegister.length} slash commands.`));

    const guildCommandData = await rest.put(
        Routes.applicationGuildCommands(appID, guildID),
        { body: commandsToRegister }
    );

    await rest.put(
        Routes.applicationCommands(appID),
        { body: [] }
    ); // Clear global commands

    if (Array.isArray(guildCommandData)) {
        console.log(chalk.gray(`Successfully refreshed ${guildCommandData.length} slash commands.`));
        return;
    }

    throw new Error('Slash commands could not be registered.');
}

export default { init, name: () => "commandRegistry" };