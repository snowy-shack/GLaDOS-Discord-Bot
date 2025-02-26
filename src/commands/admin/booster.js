import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import boosterHandler from "#src/functions/boosterHandler";
import * as logs from "#src/modules/logs";

export function init() {
    return new SlashCommandBuilder().setName("boosters")
        .setDescription("Booster controls")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName("increment")
                .setDescription("Increments boosting days of all boosters in the DB")
        )

        .addSubcommand(subcommand =>
            subcommand.setName("get")
                .setDescription("Get the number of days of a booster in the DB")
                .addUserOption(option =>
                    option.setName("user")
                        .setRequired(true)
                        .setDescription("User to fetch the boosting days for")
                )
        )
}

export async function react(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "increment": {
            await interaction.reply(logs.formatMessage("➕ Incrementing boosters"));
            console.log("Manually incrementing boosters");

            await boosterHandler.incrementAndDM();
        }
    }
}