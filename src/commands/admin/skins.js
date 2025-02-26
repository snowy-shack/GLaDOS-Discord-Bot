import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import * as skinForm from "#src/functions/skinFormHandler";
import * as logs from "#src/modules/logs";
import {all_skins, gun_skins as skins} from "#src/consts/gun_skins";

export function init() {
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
                        .addChoices(...all_skins)
                )
        );
}

export async function react(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "form": {
            const skin_type = interaction.options.getString('skin_type');
            const target_user = interaction.options.getUser('user');

            await skinForm.sendFormMessage(target_user, 0, skin_type);

            await logs.logMessage(`❓ Asking \`${target_user}\` about their Minecraft UUID to add the ${skin_type} skin.`);
            await interaction.reply(logs.formatMessage(`💎 DM'ing \`${target_user}\` with a form for the ${skin_type} skin.`));
        }
    }
}