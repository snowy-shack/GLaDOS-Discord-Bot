import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import * as logs from "#src/modules/logs";
import { emojis } from "#src/consts/phantys_home";

import { getClient } from "#src/modules/client";

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

import faqJSON from "#src/consts/faqs.json" with { type: "json" };
import rulesJSON from "#src/consts/rules.json" with { type: "json" };
import * as discord from "#src/modules/discord";
import {channels} from "#src/consts/phantys_home";
import {dateToString, formatDate} from "#src/modules/util";

export async function react(interaction) {
    let entries, channelName, channel, emoji;

    switch (interaction.options.getSubcommand()) {
        case "faq": {
            entries = faqJSON;
            channelName = "FAQ";
            channel = channels.Faq;
            emoji = emojis.PortalMod;
        } break;
        case "rules": {
            entries = rulesJSON;
            channelName = "Rules";
            channel = channels.Rules;
            emoji = emojis.Home;
        } break;
    }

    interaction.reply(logs.formatMessage("🔄️ Updating " + channelName + " Channel"));
    logs.logMessage("🔄️ Updating " + channelName + " Channel");

    // Redefine channel to the actual channel object
    channel = await discord.getChannel(channel);

    const fetchedMessages = await channel.messages.fetch({ limit: 100 });

    for (const message of fetchedMessages) {
        // if (message[1].author.id === client.application.id) { // If the message was sent by the bot
            message[1].delete();
        // }
    }

    const formattedDate = formatDate(dateToString(new Date()), true);

    setTimeout(() => {
        channel.send(logs.formatMessage(`Last ${channelName} update: ${formattedDate}`))
        for (let entry of entries) {
            channel.send(`# ${emoji} ` + entry.title.replace('___', ' *\\_\\_\\_\\_*') + '\n> ' + entry.description + '\n** **');
        }
    }, 5000);
}