import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import * as logs from "#src/modules/logs";
import emojis from "#src/consts/emojis";

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

import faqJSON from "#src/strings/faqs.json" with { type: "json" };
import rulesJSON from "#src/strings/rules.json" with { type: "json" };
import * as discord from "#src/modules/discord";

function getCurrentDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear().toString().substr(-2);

    return `${day}.${month}.${year}`;
}

export async function react(interaction) {
    let entries, channelName, channelID, emoji;

    switch (interaction.options.getSubcommand()) {
        case "faq": {
            entries = faqJSON;
            channelName = "FAQ";
            channelID = process.env.FAQ_CHANNEL_ID;
            emoji = emojis.portalmod;
            break;
        }
        case "rules": {
            entries = rulesJSON;
            channelName = "Rules";
            channelID = process.env.RULES_CHANNEL_ID;
            emoji = emojis.home;
            break;
        }
    }

    interaction.reply(logs.formatMessage("🔄️ Updating " + channelName + " Channel"));
    logs.logMessage("🔄️ Updating FAQ" + channelName + " Channel");

    const channel = await discord.getChannel(channelID);

    const fetchedMessages = await channel.messages.fetch({ limit: 100 });

    for (const message of fetchedMessages) {
        // if (message[1].author.id === client.application.id) { // If the message was sent by the bot
            message[1].delete();
        // }
    }

    const formattedDate = getCurrentDate();

    setTimeout(() => {
        channel.send(logs.formatMessage(`Last ${channelName} update: ${formattedDate}`))
        for (let entry of entries) {
            channel.send(`# ${emoji} ` + entry.title.replace('___', ' *\\_\\_\\_\\_*') + '\n> ' + entry.description + '\n** **');
        }
    }, 5000);
}