import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import boosterHandler from "#src/functions/boosterHandler";
import * as logs from "#src/modules/logs";
import {fetchBirthdays, fetchBoosters} from "#src/modules/database";
import {flags, getUserData, setFlag} from "#src/agents/flagAgent";
import {checkBirthdays} from "#src/functions/birthdayHandler";
import {dateToString} from "#src/modules/util";

export function init() {
    return new SlashCommandBuilder().setName("utils")
        .setDescription("DO NOT USE")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName("booster_inc")
                .setDescription("Increments boosting days of all boosters")
        )

        .addSubcommand(subcommand =>
            subcommand.setName("migrate_booster")
                .setDescription("Migrate booster data from DB to flags")
        )

        .addSubcommand(subcommand =>
            subcommand.setName("migrate_birthday")
                .setDescription("Migrate birthday data from DB to flags")
        )

        .addSubcommand(subcommand =>
            subcommand.setName("test")
                .setDescription("TEST COMMAND")
        )
}

export async function react(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "booster_inc": {
            interaction.reply(logs.formatMessage("➕ Incrementing boosters"));
            console.log("Manually incrementing boosters");

            await boosterHandler.incrementAndDM();
        } break;

        case "migrate_booster": {
            const boosters = await fetchBoosters();

            let migrated = 0;

            for (const booster of boosters) {
                let days = (await getUserData(booster.discord_id))[flags.Booster.BoostingDays];


                await setFlag(booster.discord_id, flags.Booster.BoostingDays, booster.days_boosted);
                if (booster.messaged) await setFlag(booster.discord_id, flags.Booster.Messaged);

                migrated++;
                if (!isNaN(days)) {
                    logs.logWarning(`WARNING: User <@${booster.discord_id}> already had ${days} boosting days, overwritten now with ${booster.days_boosted}`);
                }
            }

            interaction.reply(`Migrated ${migrated} users!`)
        } break;

        case "migrate_birthday": {
            const birthdays = await fetchBirthdays();

            let migrated = 0;

            for (const user of birthdays) {
                let oldBday = (await getUserData(user.discord_id))[flags.Birthday.Date];

                let bday = dateToString(user.birthday);

                await setFlag(user.discord_id, flags.Birthday.Date, bday);

                migrated++;
                if (oldBday) {
                    logs.logWarning(`WARNING: User <@${user.discord_id}> already had ${oldBday} as their birthday, overwritten now with ${bday}`);
                }
            }

            interaction.reply(`Migrated ${migrated} birthdays!`)
        } break;

        case "test": {
            await checkBirthdays();
            interaction.reply("dun");
        }
    }
}