import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {spamKick} from "#src/actions/spamKick";
import * as logs from "#src/modules/logs";

export function init() {
    return new SlashCommandBuilder().setName("kick")
        .setDescription("Moderation command for kicking users")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)

        .addSubcommand(subcommand =>
            subcommand.setName("spam")
                .setDescription("Kick a suspected spam- or hacked account")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to be kicked")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("reason")
                        .setDescription("The reason for the kick")
                )
        )
}

export async function react(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "spam": {
            const member = interaction.options.getMember("user");
            const reason = interaction.options.getString("reason");

            const kicked = await spamKick(member, reason ?? "None provided");

            interaction.reply(logs.formatMessage(kicked ? "👋 Kicked user." : "❌ Failed to kick user."))
        } break;
    }
}