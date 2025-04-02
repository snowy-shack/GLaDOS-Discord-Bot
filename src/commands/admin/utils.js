import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import boosterHandler from "#src/functions/boosterHandler";
import * as logs from "#src/modules/logs";
import {checkBirthdays} from "#src/functions/birthdayHandler";

export function init() {
    return new SlashCommandBuilder().setName("utils")
        .setDescription("DO NOT USE")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName("booster_inc")
                .setDescription("Increments boosting days of all boosters")
        )

        // .addSubcommand(subcommand =>
        //     subcommand.setName("test")
        //         .setDescription("TEST COMMAND")
        // )
}

export async function react(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "booster_inc": {
            interaction.reply(logs.formatMessage("➕ Incrementing boosters"));
            console.log("Manually incrementing boosters");

            await boosterHandler.incrementAndDM();
        } break;

        case "test": {
            await checkBirthdays();
            interaction.reply("dun");
        }
    }
}