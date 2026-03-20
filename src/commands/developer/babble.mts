import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    ChatInputCommandInteraction
} from "discord.js";
import * as discord from "#src/core/discord.mts";
import logs from "#src/core/logs.mts";

export function init() {
    return new SlashCommandBuilder().setName("babble")
        .setDescription("Be a good Genetic Lifeform")
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The Message")
                .setRequired(true)
        );
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.reply({content: "Speaking...", flags: MessageFlags.Ephemeral});
    await interaction.deleteReply();

    const channel = await discord.getChannel(interaction.channelId);
    if (!channel?.isSendable()) return;

    const message = interaction.options.getString("message", true).replace(/\\n/g, "\n");
    await logs.logMessage(`🗣️Babbling "${message}" by ${interaction.user}`)
    channel.send(message);
}