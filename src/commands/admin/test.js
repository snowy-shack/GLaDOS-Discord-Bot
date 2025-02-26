import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import birthdayHandler from "#src/functions/birthdayHandler";

export function init() {
    return new SlashCommandBuilder().setName("test")
        .setDescription("TEST COMMAND")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction) {
    await interaction.deferReply();
    await birthdayHandler.checkBirthdays();
}