import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import { emojis } from "#src/modules/phantys_home.mts";
import * as logs from "#src/modules/logs.mts";

import faqsJSON from "#src/consts/faqs.json" with { type: "json" };
import {InteractionReplyEmbed} from "#src/factories/styledEmbed.mjs";
import colors from "#src/consts/colors.mjs";
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

export async function react(interaction: ChatInputCommandInteraction) {
    const faqId         = interaction.options.getString("title");
    const targetMessage = interaction.options.getString("message_id");
    const targetUser    = interaction.options.getUser("reply_user");

    void logs.logMessage(`Sending requested FAQ message in ${interaction.channel}.`);
    let object = faqsJSON.find(object => object.id === faqId)
    if (!object) return;

    let faqBlock = `# ${emojis.PortalMod} ` + object.title.replace("___", " *\\_\\_\\_\\_*") + "\n> " + object.description;

    if (targetUser && targetMessage) {
        await interaction.reply(InteractionReplyEmbed("", "", "❌ Please provide either a user or a message ID", colors.Error, true));
        return;
    }

    if (targetUser && interaction.channel) {
        let replied = false;

        let scannedMessages = await interaction.channel.messages.fetch({ limit: 50 });

        for (const scannedMessage of scannedMessages) {
            if (scannedMessage[1].author.id === targetUser.id) {
                if (!replied) {
                    await scannedMessage[1].reply(faqBlock);
                    replied = true;
                    await interaction.reply({content: "replying!", flags: MessageFlags.Ephemeral});
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 1000);
                }
            }
        }

        if (!replied) {
            await interaction.reply(InteractionReplyEmbed("", "", "❌ Couldn't find recent message by user!", colors.Error, true));
            return;
        }
        return;
    }

    if (targetMessage && interaction.channel) {
        try {
            const message = await interaction.channel.messages.fetch(targetMessage);
            if (message) {
                await message.reply(faqBlock);
                await interaction.reply({content: "replying!", flags: MessageFlags.Ephemeral});
                setTimeout(() => {
                    interaction.deleteReply();
                }, 1000);

                return;
            } else {
                throw new Error("Message could not be found");
            }
        } catch (error) {
            await interaction.reply(InteractionReplyEmbed("", "", "❌ Unknown message ID", colors.Error, true));
            return;
        }
    }

    if (object) {
        await interaction.reply(faqBlock)
    } else {
        await interaction.reply(logs.FormatInteractionReplyEmbed("❌ Unknown faq ID!"));
    }
}