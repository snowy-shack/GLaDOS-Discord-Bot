import {SlashCommandBuilder, PermissionFlagsBits, MessageFlags} from "discord.js";
import * as discord from "#src/modules/discord";


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

export async function react(interaction) {
    await interaction.reply({content: "Speaking...", flags: MessageFlags.Ephemeral});
    await interaction.deleteReply();

    const channel = await discord.getChannel(interaction.channelId);
    channel.send(interaction.options.getString("message").replace(/\\n/g, "\n"));
}