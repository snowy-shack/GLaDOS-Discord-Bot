import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction
} from "discord.js";
import boosterHandler from "#src/modules/boosterTracker.mts";
import * as logs from "#src/core/logs.mts";
import {checkBirthdays} from "#src/modules/birthdayCongratulator.mts";
import {getChannel} from "#src/core/discord.mts";

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

        .addSubcommand(subcommand =>
            subcommand.setName("test")
                .setDescription("Test command")
        )
}

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case "booster_inc": {
            void interaction.reply(logs.formatMessage("➕ Incrementing boosters"));
            console.log("Manually incrementing boosters");

            await boosterHandler.incrementAndDM();
        } break;

        case "daily_birthday": {
            await checkBirthdays();
            void interaction.reply(logs.formatMessage("🍰 Reevaluated daily birthdays"));
        } break;

        case "test": {

        }
    }
}