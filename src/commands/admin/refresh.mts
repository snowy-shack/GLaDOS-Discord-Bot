import {Channel, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import * as logs from "#src/modules/logs.mts";
import {emojis} from "#src/modules/phantys_home.mts";
import * as discord from "#src/modules/discord.mts";
import {channels} from "#src/modules/phantys_home.mts";
import {dateToString, formatDate} from "#src/modules/util.mts";

export function init() {
    return new SlashCommandBuilder().setName('refresh')
        .setDescription("Refresh a channel's contents")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addSubcommand(subcommand => subcommand
                .setName("faq")
                .setDescription("Refreshes the FAQ Channel")
            )
            .addSubcommand(subcommand => subcommand
                .setName("rules")
                .setDescription("Refreshes the Rules Channel")
            )
}

export async function react(interaction: ChatInputCommandInteraction) {
    let entries: any[], channelName: string = "", channelID: string = "", emoji: string;

    switch (interaction.options.getSubcommand()) {
        case "faq": {
            entries = (await import("#src/consts/faqs.json")).default;
            channelName = "FAQ";
            channelID = channels.Faq;
            emoji = emojis.PortalMod;
        } break;
        case "rules": {
            entries = (await import("#src/consts/rules.json")).default;
            channelName = "Rules";
            channelID = channels.Rules;
            emoji = emojis.Home;
        } break;
    }

    void interaction.reply(logs.FormatInteractionReplyEmbed("🔄️ Updating " + channelName + " Channel"));
    void logs.logMessage("🔄️ Updating " + channelName + " Channel");

    // Redefine channel to the actual channel object
    const channel = await discord.getChannel(channelID);
    if (!channel?.isTextBased()) return;

    const fetchedMessages = await channel.messages.fetch({ limit: 100 });

    for (const message of fetchedMessages) {
        message[1].delete();
    }

    const formattedDate = formatDate(dateToString(new Date()), true);

    setTimeout(() => {
        channel.send(logs.FormatMessageReplyEmbed(`Last ${channelName} update: ${formattedDate}`))
        for (let entry of entries) {
            channel.send(`# ${emoji} ` + entry.title.replace('___', ' *\\_\\_\\_\\_*') + '\n> ' + entry.description + '\n** **');
        }
    }, 5000);
}