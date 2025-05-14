import {SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction} from "discord.js";
import boosterHandler from "#src/functions/boosterHandler.mts";
import * as logs from "#src/modules/logs.mts";
import {checkBirthdays} from "#src/functions/birthdayHandler.mts";

export function init() {
    return new SlashCommandBuilder().setName("utils")
        .setDescription("DO NOT USE")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName("booster_inc")
                .setDescription("Increments boosting days of all boosters")
        )

        .addSubcommand(subcommand =>
            subcommand.setName("daily_birthday")
                .setDescription("Reevaluate daily birthdays")
        )
}

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case "booster_inc": {
            void interaction.reply(logs.FormatInteractionReplyEmbed("➕ Incrementing boosters"));
            console.log("Manually incrementing boosters");

            await boosterHandler.incrementAndDM();
        } break;

        case "daily_birthday": {
            await checkBirthdays();
            void interaction.reply(logs.FormatInteractionReplyEmbed("🍰 Reevaluated daily birthdays"));
        }
    }
}