import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import colors from "#src/consts/colors.mts";
import {embedMessage} from "#src/factories/styledEmbed.mts";
import {getVersion} from "#src/modules/version.mts";

export function init() {
    return new SlashCommandBuilder().setName('about')
        .setDescription('Get information on GLaDOS');
}

export async function react(interaction: ChatInputCommandInteraction) {
    const body = ""
        + "> Management and quality \n"
        + "> of life bot for **PortalMod** \n"
        + "> and **Phanty's Home** \n"

        + "════════════════\n"
        + "> ### Commands: \n"
        + "> - `/about`\n"
        + "> - `/birthday`\n"
        + "> - `/faq`\n"
        + "> - `/rule`\n"
        + "> - `/ping`\n"

        + "════════════════\n"
        + `> Current version: **v${await getVersion()}**\n`
        + `> Latency: **${Date.now() - interaction.createdTimestamp}ms**\n`
        + "> [Source Code](https://github.com/snowy-shack/GLaDOS-Discord-Bot) - contribute!\n"


    await interaction.reply(
        embedMessage({
            body: body,
            footer: "about",
            title: "GLaDOS Discord bot",
            color: colors.Primary,
            ephemeral: false,
            thumbnail: "https://cdn.discordapp.com/avatars/1160161136373665852/2f1baa96122224e6e78057896a16b5fe.webp?size=160",
        })
    );
}