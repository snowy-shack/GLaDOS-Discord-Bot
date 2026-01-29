import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {flags, getFlag, getUserData} from "#src/modules/localStorage.mts";
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

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {

        case "stats": {
            const userID = interaction.options.getUser('user')?.id ?? interaction.user.id;
            const data = await getUserData(userID);

            const solves: Record<number, number> = {
                1: await getFlag(userID, flags.Wordle.Solves + "1") ?? 0,
                2: await getFlag(userID, flags.Wordle.Solves + "2") ?? 0,
                3: await getFlag(userID, flags.Wordle.Solves + "3") ?? 0,
                4: await getFlag(userID, flags.Wordle.Solves + "4") ?? 0,
                5: await getFlag(userID, flags.Wordle.Solves + "5") ?? 0,
                6: await getFlag(userID, flags.Wordle.Solves + "6") ?? 0,
            };

            const streak = await getFlag(userID, flags.Wordle.Streak);
            const summedGames = Object.values(solves)
                .reduce((acc, val) => acc + Number(val), 0);

            const body = `You finished ${summedGames} games, with a streak of ${streak} days.\nBelow is your solve graph.\n` +
                `-# This information may not be entirely accurate.\n` +
                renderBarGraph(solves);

            await interaction.reply(
                embedMessage({
                    body: body,
                    footer: "wordle stats",
                    title: "Wordle game stats",
                    color: colors.Success,
                    ephemeral: false,
                    // thumbnail: "https://cdn.discordapp.com/avatars/1160161136373665852/2f1baa96122224e6e78057896a16b5fe.webp?size=160",
                })
            )
        } break;
    }
}

const FULL_BLOCK = "█";
const WIDTH = 18;

function renderBarGraph( solves_x: Record<number, number> ): string {
    const values = Object.values(solves_x);
    const max = Math.max(...values);

    let output = "";

    for (let x = 1; x <= 6; x++) {
        const value = solves_x[x] ?? 0;
        const barLength = max === 0
            ? 0
            : Math.round((value / max) * WIDTH);

        output += `${x}: ${FULL_BLOCK.repeat(barLength)}\n`;
    }

    return output;
}