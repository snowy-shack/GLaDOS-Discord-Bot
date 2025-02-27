import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {spamKick} from "#src/actions/spamKick";
import * as logs from "#src/modules/logs";

export function init() {
    return new SlashCommandBuilder().setName("spam")
        .setDescription("Moderation command for spam")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName("kick")
                .setDescription("Kick a suspected spam- or hacked account")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to be kicked")
                        .setRequired(true)
                )
        )
}

export async function react(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "kick": {
            const targetUser = interaction.options.getUser("user");
            if (!targetUser) return;

            const kicked = await spamKick(targetUser.id, true);

            interaction.reply(logs.formatMessage(kicked ? "👋 Kicked user." : "❌ Failed to kick user."))
        }
    }
}