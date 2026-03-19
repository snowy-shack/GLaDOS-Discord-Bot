import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction
} from "discord.js";
import * as skinForm from "#src/modules/skinFormHandler.mts";
import * as logs from "#src/core/logs.mts";
import {getAllSkins} from "#src/modules/portalGunSkinLoader.mts";

export async function init() {
    const skins = await getAllSkins();

    return new SlashCommandBuilder().setName("skins")
        .setDescription("Portal Gun skin management")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subCommand =>
            subCommand.setName("form")
                .setDescription("DM user a skin form")
                .addUserOption(option =>
                    option.setName("user")
                        .setRequired(true)
                        .setDescription("User to DM the Portal Gun skin form")
                )
                .addStringOption(option =>
                    option.setName("skin_type")
                        .setDescription("The Portal Gun skin to give")
                        .setRequired(true)
                        .addChoices(...skins)
                )
        );
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    switch (interaction.options.getSubcommand()) {
        case "form": {
            const skin_type = interaction.options.getString('skin_type');
            const target_user = interaction.options.getUser('user');

            if (!target_user || !skin_type) return;

            await skinForm.sendFormMessage(target_user, 0, undefined, skin_type);

            await logs.logMessage(`❓ Asking @${target_user.username} about their Minecraft UUID to add the ${skin_type} skin.`);
            await interaction.editReply(logs.formatMessage(`💎 DM'ing @${target_user.username} with a form for the ${skin_type} skin.`));
        } break;
    }
}