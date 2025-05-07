import { SlashCommandBuilder } from "discord.js";
import * as logs from "#src/modules/logs.mts";

export function init() {
    return new SlashCommandBuilder().setName('ping')
        .setDescription('Ping GLaDOS');
}

export async function react(interaction) {
    await interaction.reply(logs.FormatMessageReplyEmbed(`🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms`));
}