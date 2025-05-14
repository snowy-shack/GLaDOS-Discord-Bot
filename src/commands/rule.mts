import {ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import { emojis } from "#src/consts/phantys_home.mts";
import * as logs from "#src/modules/logs.mts";

import rulesJSON from "#src/consts/rules.json" with { type: "json" };
import {InteractionReplyEmbed} from "#src/factories/styledEmbed.mjs";
import colors from "#src/consts/colors.mjs";
const options = rulesJSON.map(object => ({name: object.title, value: object.id})); // Get a list of rules for the rule command

export function init() {
    return new SlashCommandBuilder().setName('rule')
        .setDescription('Sends rule replies')
        .addStringOption(option =>
            option.setName('rule')
                .setDescription('The rule')
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
    const ruleId = interaction.options.getString("rule");
    const targetMessage = interaction.options.getString("message_id");
    const targetUser = interaction.options.getUser("reply_user");

    void logs.logMessage(`Sending requested rule message in ${interaction.channel}.`);
    const object = rulesJSON.find(object => object.id === ruleId)
    if (!object) return;

    const ruleBlock = `# ${emojis.Home} ` + object.title + '\n> ' + object.description;

    if (targetUser && targetMessage) {
        void interaction.reply(InteractionReplyEmbed("", "", "❌ Please provide either a user or a message ID", colors.Error, true));
        return;
    }

    if (targetUser && interaction.channel) {
        let replied = false;

        let scannedMessages = await interaction.channel.messages.fetch({ limit: 50 });

        for (const scannedMessage of scannedMessages) {
            if (scannedMessage[1].author.id === targetUser.id) {
                if (!replied) {
                    await scannedMessage[1].reply(ruleBlock);
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
                await message.reply(ruleBlock);
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
        await interaction.reply(ruleBlock)
    } else {
        await interaction.reply(InteractionReplyEmbed("", "", "❌ Unknown message ID", colors.Error, true));
    }
}