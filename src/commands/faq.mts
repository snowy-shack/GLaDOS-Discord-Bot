import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import { emojis } from "#src/core/phantys_home.mts";

import faqsJSON from "#src/consts/faqs.json" with { type: "json" };
import {reactWithTemplate} from "#src/commands/_shared/dictionaryResponses.mts";
const options = faqsJSON.map(object => ({name: object.title, value: object.id})); // Get a list of FAQ titles for the FAQ command

export function init() {
    return new SlashCommandBuilder().setName('faq')
        .setDescription('Sends FAQ Replies')
        .addStringOption(option =>
            option.setName('faq')
                .setDescription('The FAQ Message')
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
        items: faqsJSON,
        itemType: "faq",
        emoji: emojis.PortalMod,
    });
}