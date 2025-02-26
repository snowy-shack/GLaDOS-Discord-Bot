import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { spamKick } from "#src/actions/spam_kick";

export function init() {
    return new SlashCommandBuilder().setName("test")
        .setDescription("TEST COMMAND")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction) {
    await interaction.deferReply();

    // Functionality
    await spamKick(interaction.user.id);
}