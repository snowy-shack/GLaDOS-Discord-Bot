import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    InteractionResponseType,
    MessageFlags,
    Routes,
    SlashCommandBuilder
} from "discord.js";
import {getUserField, removeUserField, setUserField, userFields} from "#src/modules/localStorage.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";
import {daysSince} from "#src/core/util.mts";
import {channels} from "#src/core/phantys_home.mts";
import wordlePlayStatus from "#src/modules/wordlePlayStatus.mts";

// Discord doesn't support custom button colors - Secondary (gray) is the closest to "dark"
export function playButtonRow() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("commands.wordle#play")
            .setLabel("Play!")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("commands.wordle#stats")
            .setLabel("View stats")
            .setStyle(ButtonStyle.Secondary)
    );
}

export const name = 'wordle';

export function init() {
    return new SlashCommandBuilder()
        .setName("wordle")
        .setDescription("Do wordle-related things")
        .addSubcommand(subcommand => subcommand
            .setName('play')
            .setDescription("Launch today's Wordle")
        )
        .addSubcommand(subcommand => subcommand
            .setName('stats')
            .setDescription("View your tracked wordle stats")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("User to view the wordle stats of (optional)")
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('reminder')
            .setDescription("Get pinged daily at 10 AM to play that day's Wordle")
            .addStringOption(option =>
                option.setName("state")
                    .setDescription("Turn daily reminders on or off")
                    .setRequired(true)
                    .addChoices(
                        {name: "on", value: "on"},
                        {name: "off", value: "off"},
                    )
            )
        );
}

export type wordleKeys = keyof typeof userFields.Wordle;

export function getWordleStats(userID: string) {
    const solves: Record<number, number> = {
        1: getUserField(userID, userFields.Wordle.Solves1) ?? 0,
        2: getUserField(userID, userFields.Wordle.Solves2) ?? 0,
        3: getUserField(userID, userFields.Wordle.Solves3) ?? 0,
        4: getUserField(userID, userFields.Wordle.Solves4) ?? 0,
        5: getUserField(userID, userFields.Wordle.Solves5) ?? 0,
        6: getUserField(userID, userFields.Wordle.Solves6) ?? 0,
        0: getUserField(userID, userFields.Wordle.SolvesX) ?? 0,
    };

    const streak = getUserField(userID, userFields.Wordle.Streak) ?? 0;
    const lastScore = getUserField(userID, userFields.Wordle.LastScore) ?? NaN;
    const firstPlayed = getUserField(userID, userFields.Wordle.FirstPlayed);

    const totalGames = Object.values(solves).reduce((acc, val) => acc + Number(val), 0);
    const successfulGames = totalGames - solves[0];
    const weightedSum = Object.entries(solves)
        .filter(([score]) => score !== "0")
        .reduce((acc, [score, count]) => acc + (Number(score) * Number(count)), 0);

    const average = successfulGames > 0 ? (weightedSum / successfulGames).toFixed(2) : "0";
    const daysTracked = firstPlayed ? daysSince(firstPlayed) : 0;
    const participation = daysTracked > 0 ? ((totalGames / daysTracked) * 100).toFixed(1) : "0";

    return {solves, streak, lastScore, firstPlayed, totalGames, average, participation};
}

function buildStatsBody(userID: string, pronouns: readonly [unknown, string, string]) {
    const {solves, streak, lastScore, totalGames, average, participation} = getWordleStats(userID);

    return `${pronouns[0]} played **${totalGames} games** (**${participation}% participation**), with a streak of **${streak} days**.`
        + `\n### ${pronouns[1]} average score is **${average}**.`
        + `\nBelow is ${pronouns[2]} solve graph.`
        + '\n' + renderBarGraph(solves, lastScore)
        + `\n-# This information may not be entirely accurate.`;
}

// Normal commands don't get a reply() helper for this - Discord's client opens the
// Activity itself once it sees this response type, no message needs sending.
async function launchActivity(interaction: ChatInputCommandInteraction | ButtonInteraction) {
    await interaction.client.rest.post(
        Routes.interactionCallback(interaction.id, interaction.token),
        {body: {type: InteractionResponseType.LaunchActivity}, auth: false}
    );

    void wordlePlayStatus.announceStarted(interaction.user.id);
}

export async function buttonPressed(buttonID: string, interaction: ButtonInteraction) {
    if (buttonID === "play") await launchActivity(interaction);

    if (buttonID === "stats") {
        await interaction.reply(
            embedMessage({
                body: buildStatsBody(interaction.user.id, ["You", "Your", "your"] as const),
                footer: "wordle stats",
                title: "Wordle game stats",
                color: colors.Primary,
                ephemeral: true,
            })
        );
    }
}

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {

        case "play": {
            if (interaction.channelId !== channels.Arcade) {
                await interaction.reply({
                    content: `Please play in <#${channels.Arcade}> instead!`,
                    flags: MessageFlags.Ephemeral,
                });
                break;
            }

            await launchActivity(interaction);
        } break;

        case "stats": {
            const user = interaction.options.getUser('user');
            const userID = user?.id ?? interaction.user.id;
            const pronouns = user ? [user, "Their", "their"] as const : ["You", "Your", "your"] as const;

            await interaction.reply(
                embedMessage({
                    body: buildStatsBody(userID, pronouns),
                    footer: "wordle stats",
                    title: "Wordle game stats",
                    color: colors.Primary,
                    ephemeral: false,
                })
            );
        } break;

        case "reminder": {
            const state = interaction.options.getString("state", true);

            if (state === "on") {
                await setUserField(interaction.user.id, userFields.Wordle.ReminderEnabled);
            } else {
                await removeUserField(interaction.user.id, userFields.Wordle.ReminderEnabled);
            }

            await interaction.reply(
                embedMessage({
                    body: state === "on"
                        ? "You'll now be pinged daily at **10 AM** to play that day's Wordle."
                        : "You won't be pinged for Wordle reminders anymore.",
                    color: colors.Primary,
                    ephemeral: true,
                })
            );
        } break;
    }
}

const FULL_BLOCK = "█";
const WIDTH = 18;

export function renderBarGraph( solves_x: Record<number, number>, lastScore: number ): string {
    const values = Object.values(solves_x);
    const max = Math.max(...values);

    let output = "```ansi\n";

    for (let x = 1; x <= 6; x++) {
        const value = solves_x[x] ?? 0;
        const barLength = max === 0
            ? 0
            : Math.round((value / max) * WIDTH);

        output += x === lastScore ? `${x}: \x1b[0;32m${FULL_BLOCK.repeat(barLength)}\x1b[0m\n` : `${x}: ${FULL_BLOCK.repeat(barLength)}\n`;
    }

    return output + "```";
}