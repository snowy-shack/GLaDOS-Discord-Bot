import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {spamKick} from "#src/actions/spamKick.mts";
import * as logs from "#src/core/logs.mts";
import {getMember} from "#src/core/discord.mts";
import {userLockup} from "#src/actions/userLockup.mts";
import {flags, setFlag} from "#src/modules/localStorage.mts";

export function init() {
    return new SlashCommandBuilder().setName("moderator")
        .setDescription("Moderation command managing users")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)

        .addSubcommand(subcommand =>
            subcommand.setName("spam-kick")
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
        .addSubcommand(subcommand =>
            subcommand.setName("lockup")
                .setDescription("Lockup command to time out users")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to be locked up")
                        .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("unlock")
                .setDescription("Unlock command to un-timeout users")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to be freed")
                        .setRequired(true)
                )
        )
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    switch (interaction.options.getSubcommand()) {
        case "spam-kick": {
            let member: GuildMember | undefined = await getMember(interaction.options.getUser("user")?.id ?? "");
            let reason = interaction.options.getString("reason");

            if (!member) return;

            const kicked = await spamKick(member, reason ?? "None provided");

            await interaction.editReply(logs.formatMessage(kicked ? "👋 Kicked user." : "❌ Failed to kick user."))
        } break;

        case "lockup": {
            let member: GuildMember | undefined = await getMember(interaction.options.getUser("user")?.id ?? "");
            if (member) {
                await userLockup(member, null);
                await interaction.editReply(logs.formatMessage(`Locked up ${member}!`));
            } else {
                await logs.logWarning("❌Could not lock user up!");
                await interaction.editReply(logs.formatMessage("❌Could not lock user up!"));
            }
        } break;

        case "unlock": {
            let member: GuildMember | undefined = await getMember(interaction.options.getUser("user")?.id ?? "");
            if (member) {
                await member.timeout(null);
                await setFlag(member.id, flags.Security.LockedUp, "false");
                await interaction.editReply(logs.formatMessage(`Freed ${member}!`));
            } else {
                await logs.logWarning("❌Could not lock user up!");
                await interaction.editReply(logs.formatMessage("❌Could not lock user up!"));
            }
        }
    }
}