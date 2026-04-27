import {ChatInputCommandInteraction, SlashCommandBuilder, TextBasedChannel} from "discord.js";
import * as logs from "#src/core/logs.mts";
import {reply} from "#src/commands/_shared/dictionaryResponses.mts";

export const name = 'tooltips';

export function init() {
    return new SlashCommandBuilder().setName('tooltips')
        .setDescription('Tell people to please consult the tooltips')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('Will reply to a specific message (by ID)')
        )
        .addUserOption(option =>
            option.setName('reply_user')
                .setDescription('Will reply to the last message sent by a user')
        );
}

const deleteAckAfterMs = 3000;
export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
        // flags: MessageFlags.Ephemeral,
    });

    const targetMessage = interaction.options.getString("message_id");
    const targetUser = interaction.options.getUser("reply_user");

    void logs.logMessage(
        `Someone shall consult the tooltips in ${interaction.channel}.`
    );

    const content = "https://cdn.discordapp.com/attachments/876477593245868114/1496260041773285386/image.png?ex=69e93c41&is=69e7eac1&hm=b58c9cc501d9bd2cebac9ca19c2cb126389fa442b8cfb5e6e31d241861b74046&";

    // Prevent conflicting target parameters
    if (targetUser && targetMessage) {
        await reply(interaction, "Please provide either a user or a message ID.", true);
        return;
    }

    const channel = interaction.channel as TextBasedChannel | null;

    // Reply to most recent message from a user
    if (targetUser && channel) {
        let replied = false;

        const scanned = await channel.messages.fetch({ limit: 50 });
        for (const msg of scanned.values()) {
            if (msg.author.id === targetUser.id) {
                await msg.reply(content);
                replied = true;
                await reply(interaction, "Replied!");

                setTimeout(() => void interaction.deleteReply().catch(() => {}), deleteAckAfterMs);
                break;
            }
        }

        if (!replied) {
            await reply(interaction, "Couldn't find recent message by user!", true);
        }
        return;
    }

    // Reply to specific message ID
    if (targetMessage && channel) {
        try {
            const msg = await channel.messages.fetch(targetMessage);
            await msg.reply(content);
            await reply(interaction, "Replied!");
            setTimeout(() => void interaction.deleteReply().catch(() => {}), deleteAckAfterMs);
        } catch (err) {
            await reply(interaction, "Unknown message ID.", true);
        }
        return;
    }

    // Default: edit the interaction reply with the block
    await interaction.editReply(content);
}