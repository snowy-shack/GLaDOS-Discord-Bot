import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction, InteractionReplyOptions
} from "discord.js";
import * as skinForm from "#src/modules/skinFormHandler.mts";
import * as logs from "#src/core/logs.mts";
import {getAllSkins} from "#src/modules/portalGunSkinLoader.mts";
import {errorEmbedMessage} from "#src/formatting/styledEmbed.mts";
import {getRoleUsers} from "#src/core/discord.mts";
import {getUserField, userField} from "#src/modules/localStorage.mts";

export async function init() {
    const skins = await getAllSkins();

    return new SlashCommandBuilder().setName("skins")
        .setDescription("Portal Gun skin management")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subCommand =>
            subCommand.setName("form")
                .setDescription("DM user(s) a skin form")
                .addStringOption(option =>
                    option.setName("skin_type")
                        .setDescription("The Portal Gun skin to give")
                        .setRequired(true)
                        .addChoices(...skins)
                )
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Specific user to DM")
                )
                .addRoleOption(option =>
                    option.setName("role")
                        .setDescription("Send to everyone with this role")
                )
        );
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    switch (interaction.options.getSubcommand()) {
        case "form": {
            const skin_type = interaction.options.getString('skin_type', true);
            const target_user = interaction.options.getUser('user');
            const target_role = interaction.options.getRole('role');

            if (!target_user && !target_role) {
                return await interaction.editReply(errorEmbedMessage("Please specify a user or a role."));
            }

            const recipients = new Set<any>();
            if (target_user) recipients.add(target_user);

            if (target_role && interaction.guild) {
                const members = await getRoleUsers(target_role.id);
                if (!members) return await interaction.editReply(errorEmbedMessage("Please specify a user or a role."));

                const roleMembers = members.filter(m => !m.user.bot);
                roleMembers.forEach(m => recipients.add(m.user));
            }

            const results: number[] = await Promise.all(Array.from(recipients).map(async (user) => {
                const unlocked = await getUserField(user.id, `${skin_type}.unlocked` as userField);
                if (!unlocked) {
                    await skinForm.sendFormMessage(user, 0, undefined, skin_type);
                    return 1;
                }
                return 0;
            }));

            const noMessaged = results.reduce((acc, val) => acc + val, 0);

            const targetDesc = target_role ? `role @${target_role.name}` : `@${target_user?.username}`;
            await logs.logMessage(`❓ Sent form to ${targetDesc} for the ${skin_type} skin.`);
            await interaction.editReply(logs.formatMessage(`💎 Processed ${noMessaged} DM(s) for the ${skin_type} skin.`));
        } break;
    }
}