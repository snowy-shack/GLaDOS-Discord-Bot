import {ChatInputCommandInteraction, Message, SlashCommandBuilder} from "discord.js";
import {userFields, getUserField, getUserData, getGlobalField, globalFields} from "#src/modules/localStorage.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";

export function init() {
    return new SlashCommandBuilder()
        .setName("wordle")
        .setDescription("Do wordle-related things")
        .addSubcommand(subcommand => subcommand
            .setName('stats')
            .setDescription("View your tracked wordle stats")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("User to view the wordle stats of (optional)")
            )
        );
}

export type wordleKeys = keyof typeof userFields.Wordle;
export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {

        case "stats": {
            const user = interaction.options.getUser('user');
            const userID = user?.id ?? interaction.user.id;

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
            const globalTotal = getGlobalField(globalFields.Wordle.GamesTracked) ?? 0;

            const totalGames = Object.values(solves).reduce((acc, val) => acc + Number(val), 0);
            const successfulGames = totalGames - solves[0];
            const weightedSum = Object.entries(solves)
                .filter(([score]) => score !== "0")
                .reduce((acc, [score, count]) => acc + (Number(score) * Number(count)), 0);

            const average = successfulGames > 0 ? (weightedSum / successfulGames).toFixed(2) : 0;
            const participation = globalTotal > 0 ? ((totalGames / globalTotal) * 100).toFixed(1) : 0;

            const pronouns = user ? [user, "Their", "their"] : ["You", "Your", "your"];
            const body = `${pronouns[0]} played **${totalGames} games** (**${participation}% participation**), with a streak of **${streak} days**.`
                + `\n### ${pronouns[1]} average score is **${average}**.`
                + `\nBelow is ${pronouns[2]} solve graph.`
                + '\n' + renderBarGraph(solves, lastScore)
                + `\n-# This information may not be entirely accurate.`;

            await interaction.reply(
                embedMessage({
                    body: body,
                    footer: "wordle stats",
                    title: "Wordle game stats",
                    color: colors.Primary,
                    ephemeral: false,
                })
            );
        } break;
    }
}

const FULL_BLOCK = "█";
const WIDTH = 18;

function renderBarGraph( solves_x: Record<number, number>, lastScore: number ): string {
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