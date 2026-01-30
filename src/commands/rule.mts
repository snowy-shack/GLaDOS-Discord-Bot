import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import { emojis } from "#src/core/phantys_home.mts";

import rulesJSON from "#src/consts/rules.json" with { type: "json" };
import {reactWithTemplate} from "#src/commands/_shared/dictionaryResponses.mts";
const options = rulesJSON.map(object => ({name: object.title, value: object.id})); // Get a list of rules for the rule command

export function init() {
    return new SlashCommandBuilder().setName('rule')
        .setDescription('Sends rule replies')
        .addStringOption(option =>
            option.setName('rule')
                .setDescription('The rule')
                .setRequired(true)
                .addChoices(...options)
        )
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('Will reply to a specific message (by ID)')
        )
        .addUserOption(option =>
            option.setName('reply_user')
                .setDescription('Will reply to the last message sent by a user')
        );
}

export async function react(interaction: ChatInputCommandInteraction) {
    await reactWithTemplate(interaction, {
        items: rulesJSON,
        itemType: "rule",
        emoji: emojis.Home,
    });
}