import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import {networkInterfaces} from "node:os";
import boosterHandler from "#src/modules/boosterTracker.mts";
import * as logs from "#src/core/logs.mts";
import {checkBirthdays} from "#src/modules/birthdayCongratulator.mts";
import {h} from "#src/modules/coreModule.mts";

export const name = 'utils';

export function init() {
    return new SlashCommandBuilder().setName("utils")
        .setDescription("DO NOT USE")

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
                .addStringOption(option =>
                    option.setName('input')
                        .setDescription('Some input')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand.setName("ip")
                .setDescription("Show local and public IP addresses")
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

        case "ip": {
            const nets = networkInterfaces();
            const localIPs = Object.values(nets)
                .flat()
                .filter(n => n && n.family === 'IPv4' && !n.internal)
                .map(n => n!.address);

            const publicRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
            const publicIP = publicRes?.ok ? (await publicRes.json() as any).ip : 'unavailable';

            await interaction.reply({
                content: `**Local:** \`${localIPs.join(', ') || 'none'}\`\n**Public:** \`${publicIP}\``,
                flags: MessageFlags.Ephemeral,
            });
        } break;

        case "test": {
            const text = interaction.options.getString("input", true);
            switch (text) {
                case "exception":
                    await interaction.reply("💥 Throwing uncaught exception...");
                    setTimeout(() => { throw new Error("Test uncaught exception"); }, 0);
                    break;
                case "rejection":
                    await interaction.reply("💥 Throwing unhandled rejection...");
                    Promise.reject(new Error("Test unhandled rejection"));
                    break;
                case "exit":
                    await interaction.reply("💥 Calling process.exit(1)...");
                    process.exit(1);
                default: {
                    const a = await h(text);
                    await interaction.reply(a);
                }
            }
        }
    }
}