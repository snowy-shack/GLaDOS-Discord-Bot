import {ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {spamKick} from "#src/actions/spamKick.mts";
import * as logs from "#src/modules/logs.mts";
import {getMember} from "#src/modules/discord.mts";

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

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case "spam": {
            let member: GuildMember | undefined = await getMember(interaction.options.getUser("user")?.id ?? "");
            let reason = interaction.options.getString("reason");

            if (!member) return;

            const kicked = await spamKick(member, reason ?? "None provided");

            await interaction.reply(logs.FormatInteractionReplyEmbed(kicked ? "👋 Kicked user." : "❌ Failed to kick user."))
        } break;
    }
}