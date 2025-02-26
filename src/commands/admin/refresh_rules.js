import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import * as logs from "#src/modules/logs";
import emojis from "#src/consts/emojis";

import rulesJSON from "#src/strings/rules.json" with { type: "json" };

export function init() {
    return new SlashCommandBuilder().setName('refresh_rules')
        .setDescription('Refreshes the rules channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction) {
    const client = await import("#src/modules/client");
    await interaction.reply(logs.formatMessage('🔄️ Updating rules'));
    await logs.logMessage('🔄️ Updating rules');

    const channel = client.channels.cache.get(process.env.RULES_CHANNEL_ID);

    channel.messages.fetch({ limit: 100 }).then(async messageScan => {
        for (const scannedMessage of messageScan) {
            if (scannedMessage.author.id === client.application.id) { // If the message was sent by the bot
                scannedMessage.delete();
            }
        }
    });

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear().toString().substr(-2);

    const formattedDate = `${day}.${month}.${year}`;

    setTimeout(() => {
        channel.send(logs.formatMessage(`Last rules update: ${formattedDate}`))
        for (rule of rulesJSON) {
            channel.send(`# ${emojis.home} ` + rule.title + '\n> ' + rule.description + '\n** **');
        }
    }, 5000);
}