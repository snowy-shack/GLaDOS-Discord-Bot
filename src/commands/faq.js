import { SlashCommandBuilder } from "discord.js";
import emojis from "#src/consts/emojis";
import * as logs from "#src/modules/logs";

import faqsJSON from "#src/strings/faqs.json" with { type: "json" };
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
    const faqId         = interaction.options.getString('title');
    const targetMessage = interaction.options.getString('message_id');
    const targetUser    = interaction.options.getUser('reply_user');

    // console.log(`FAQ requested by ${interaction.user}`);
    let object = faqsJSON.find(object => object.id == faqId)

    let faqBlock = `# ${emojis.portalmod} ` + object.title.replace('___', ' *\\_\\_\\_\\_*') + '\n> ' + object.description;

    if (targetUser && targetMessage) {
        interaction.reply({content: logs.formatMessage('❌ Please provide either a user or a message ID'), ephemeral: true});
        return;
    }

    if (targetUser) {
        let replied = false;
        interaction.channel.messages.fetch({ limit: 50 }).then(async messageScan => {
            messageScan.forEach(async scannedMessage => {
                if (scannedMessage.author == targetUser) {
                    if (replied == false) {
                        scannedMessage.reply(faqBlock);
                        replied = true;
                        interaction.reply({content: logs.formatMessage('✅ Succesfully replied to user\'s latest message!'), ephemeral: true});
                    }
                }
            });
        });
        if (replied == false) {
            interaction.reply({content: logs.formatMessage('❌ Couldn\'t find recent message by user!'), ephemeral: true});
            return;
        }
        return;
    }

    if (targetMessage) {
        try {
            const message = await interaction.channel.messages.fetch(targetMessage);
            if (message) {
                message.reply(faqBlock);
                interaction.reply({content: logs.formatMessage('✅ Succesfully replied to their message!'), ephemeral: true});
                return;
            } else {
                throw new Error('Message could not be found');
            }
        } catch (error) {
            interaction.reply({content: logs.formatMessage('❌ Unknown message ID!'), ephemeral: true});
            return;
        }
    };

    if (object) {
        await interaction.reply(faqBlock)
    } else {
        await interaction.reply(logs.formatMessage('❌ Unknown faq ID!'));
    };
}

export default { react, init };