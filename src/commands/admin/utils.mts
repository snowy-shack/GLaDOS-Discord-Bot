import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import {networkInterfaces} from "node:os";
import boosterHandler from "#src/modules/boosterTracker.mts";
import * as logs from "#src/core/logs.mts";
import {checkBirthdays} from "#src/modules/birthdayCongratulator.mts";
import wordleReminder from "#src/modules/wordleReminder.mts";
import {getRoleUsers} from "#src/core/discord.mts";
import {roles} from "#src/core/phantys_home.mts";
import {toError} from "#src/core/try-catch.mts";
import {setUserField, userFields} from "#src/modules/localStorage.mts";

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
                        .addChoices(
                            {name: "exception", value: "exception"},
                            {name: "rejection", value: "rejection"},
                            {name: "exit", value: "exit"},
                            {name: "wordle_reminder", value: "wordle_reminder"},
                            {name: "wordle_streak", value: "wordle_streak"},
                            {name: "members_fetch", value: "members_fetch"},
                            {name: "wordle_pending", value: "wordle_pending"},
                            {name: "wordle_role_sync", value: "wordle_role_sync"},
                            {name: "wordle_set_streak", value: "wordle_set_streak"},
                        )
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
                case "wordle_reminder":
                    await interaction.reply("📅 Sending wordle daily reminder...");
                    await wordleReminder.sendDailyReminder();
                    break;
                case "wordle_streak":
                    await interaction.reply("🔥 Sending wordle streak warning...");
                    await wordleReminder.sendStreakWarning();
                    break;
                case "members_fetch": {
                    await interaction.deferReply();
                    const wsSnapshot = () => {
                        const ws = interaction.client.ws;
                        return `ws.status=${ws.status}, ws.ping=${ws.ping}ms, shards=${ws.shards.size}`;
                    };
                    const before = wsSnapshot();
                    const start = Date.now();
                    try {
                        const members = await getRoleUsers(roles.WordleReminders);
                        await interaction.editReply(
                            `✅ getRoleUsers resolved in ${Date.now() - start}ms with ${members?.length ?? "null"} member(s)\n`
                            + `Before: ${before}\nAfter: ${wsSnapshot()}\n`
                            + (members?.map(m => m.id).join(", ") ?? "none")
                        );
                    } catch (error) {
                        await interaction.editReply(
                            `💥 getRoleUsers threw after ${Date.now() - start}ms: ${toError(error).message}\n`
                            + `Before: ${before}\nAfter: ${wsSnapshot()}`
                        );
                    }
                } break;
                case "wordle_pending": {
                    const ids = wordleReminder.getPendingReminderIds();
                    await interaction.reply(
                        `${ids.length} pending: ${ids.map(id => `<@${id}>`).join(", ") || "none"}`
                    );
                } break;
                case "wordle_role_sync":
                    await interaction.reply("🔄 Syncing wordle reminder role/pending list for all subscribers...");
                    await wordleReminder.addReminderRoleToSubscribers();
                    break;
                case "wordle_set_streak":
                    await setUserField(interaction.user.id, userFields.Wordle.Streak, 19999);
                    await interaction.reply(`🔥 Set your wordle streak to 19999.`);
                    break;
                default:
                    await interaction.reply("Unknown test. Use exception, rejection, exit, wordle_reminder, wordle_streak, members_fetch, wordle_pending, wordle_role_sync or wordle_set_streak.");
            }
        }
    }
}