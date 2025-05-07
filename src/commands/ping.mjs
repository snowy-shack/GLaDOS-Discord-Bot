import { SlashCommandBuilder } from "discord.js";
import * as logs from "#src/modules/logs.mjs";

export function init() {
    return new SlashCommandBuilder().setName('ping')
        .setDescription('Ping GLaDOS');
}

export async function react(interaction) {
    await interaction.reply(logs.formatMessage(`🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms`));
}