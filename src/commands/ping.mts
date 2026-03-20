import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import * as logs from "#src/core/logs.mts";

export const name = 'ping';

export function init() {
    return new SlashCommandBuilder().setName('ping')
        .setDescription('Ping GLaDOS');
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.reply(logs.formatMessage(`🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms`));
}