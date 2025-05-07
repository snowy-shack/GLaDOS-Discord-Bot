import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import * as logs from "#src/modules/logs.mts";

export function init() {
    return new SlashCommandBuilder().setName('ping')
        .setDescription('Ping GLaDOS');
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.reply(logs.FormatInteractionReplyEmbed(`🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms`));
}