import {MessageFlags, SlashCommandBuilder} from "discord.js";
import { emojis } from "#src/consts/phantys_home";
import * as logs from "#src/modules/logs";

import faqsJSON from "#src/consts/faqs.json" with { type: "json" };
const options = faqsJSON.map(object => ({name: object.title, value: object.id})); // Get a list of FAQ titles for the FAQ command

export function init() {
    return new SlashCommandBuilder().setName('faq')
        .setDescription('Sends FAQ Replies')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The FAQ Message')
                .setRequired(true)
                .addChoices(...options)
        )
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('Will reply to a specific message (by ID)')
        )
        .addUserOption(option =>
            option.setName('reply_user')
                .setDescription('Will reply to the last message sent by a user')
        );
}

export async function react(interaction) {
    const faqId         = interaction.options.getString("title");
    const targetMessage = interaction.options.getString("message_id");
    const targetUser    = interaction.options.getUser("reply_user");

    logs.logMessage(`Sending requested FAQ message in ${interaction.channel}.`);
    let object = faqsJSON.find(object => object.id === faqId)

    let faqBlock = `# ${emojis.PortalMod} ` + object.title.replace("___", " *\\_\\_\\_\\_*") + "\n> " + object.description;

    if (targetUser && targetMessage) {
        interaction.reply({content: logs.formatMessage("❌ Please provide either a user or a message ID"), flags: MessageFlags.Ephemeral});
        return;
    }

    if (targetUser) {
        let replied = false;

        let scannedMessages = await interaction.channel.messages.fetch({ limit: 50 });

        for (const scannedMessage of scannedMessages) {
            if (scannedMessage[1].author.id === targetUser.id) {
                if (!replied) {
                    await scannedMessage[1].reply(faqBlock);
                    replied = true;
                    interaction.reply({content: "replying!", flags: MessageFlags.Ephemeral});
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 1000);
                }
            }
        }

        if (replied === false) {
            interaction.reply({content: logs.formatMessage("❌ Couldn't find recent message by user!"), flags: MessageFlags.Ephemeral});
            return;
        }
        return;
    }

    if (targetMessage) {
        try {
            const message = await interaction.channel.messages.fetch(targetMessage);
            if (message) {
                message.reply(faqBlock);
                interaction.reply({content: "replying!", flags: MessageFlags.Ephemeral});
                setTimeout(() => {
                    interaction.deleteReply();
                }, 1000);

                return;
            } else {
                throw new Error("Message could not be found");
            }
        } catch (error) {
            interaction.reply({content: logs.formatMessage("❌ Unknown message ID!"), flags: MessageFlags.Ephemeral});
            return;
        }
    }

    if (object) {
        await interaction.reply(faqBlock)
    } else {
        await interaction.reply(logs.formatMessage("❌ Unknown faq ID!"));
    }
}