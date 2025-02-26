import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
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
    await interaction.reply({content: "Speaking...", ephemeral: true});  // otherwise it will say "application did not respond"
    await interaction.deleteReply();

    discord.getChannel(interaction.channelId).send(interaction.options.getString("message"));
}