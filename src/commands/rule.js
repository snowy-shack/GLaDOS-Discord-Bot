import { SlashCommandBuilder } from "discord.js";
import emojis from "#src/consts/emojis";
import * as logs from "#src/modules/logs";

import rulesJSON from "#src/strings/rules.json" with { type: "json" };
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

export async function react(interaction) {
    const ruleId = interaction.options.getString("rule");
    const targetMessage = interaction.options.getString("message_id");
    const targetUser = interaction.options.getUser("reply_user");

    logs.logMessage(`Sending requested rule message in \`${interaction.channel}\`.`);
    const object = rulesJSON.find(object => object.id === ruleId)

    const ruleBlock = `# ${emojis.home} ` + object.title + '\n> ' + object.description;

    if (targetUser && targetMessage) {
        interaction.reply({content: logs.formatMessage("❌ Please provide either a user or a message ID"), ephemeral: true});
        return;
    }

    if (targetUser) {
        let replied = false;

        let scannedMessages = await interaction.channel.messages.fetch({ limit: 50 });

        for (const scannedMessage of scannedMessages) {
            if (scannedMessage[1].author.id === targetUser.id) {
                if (!replied) {
                    await scannedMessage[1].reply(ruleBlock);
                    replied = true;
                    interaction.reply({content: "replying!", ephemeral: true});
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 1000);
                }
            }
        }

        if (replied === false) {
            interaction.reply({content: logs.formatMessage("❌ Couldn't find recent message by user!"), ephemeral: true});
            return;
        }
        return;
    }

    if (targetMessage) {
        try {
            const message = await interaction.channel.messages.fetch(targetMessage);
            if (message) {
                message.reply(ruleBlock);
                interaction.reply({content: "replying!", ephemeral: true});
                setTimeout(() => {
                    interaction.deleteReply();
                }, 1000);

                return;
            } else {
                throw new Error("Message could not be found");
            }
        } catch (error) {
            interaction.reply({content: logs.formatMessage("❌ Unknown message ID!"), ephemeral: true});
            return;
        }
    }

    if (object) {
        await interaction.reply(ruleBlock)
    } else {
        await interaction.reply(logs.formatMessage("❌ Unknown rule ID!"));
    }
}