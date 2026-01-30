import {ChatInputCommandInteraction, MessageFlags, TextBasedChannel,} from "discord.js";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";
import * as logs from "#src/core/logs.mts";
import {icons} from "#src/consts/icons.mts";

type Item = { id: string; title: string; description: string };

function block(emoji: string, title: string, description: string) {
    return `# ${emoji} ${title}\n> ${description}`;
}

async function reply(interaction: ChatInputCommandInteraction, message: string, error?: boolean) {
    await interaction.editReply(
        embedMessage({
            title: message,
            color: error ? colors.Error : colors.Primary,
            ephemeral: true,
            ...(error && { icon: icons.mark })
        })
    );
}
const deleteAckAfterMs = 3000;

export async function reactWithTemplate(interaction: ChatInputCommandInteraction, opts: {
    items: Item[];
    itemType: string;
    emoji: string;
}) {
    const {
        items,
        itemType,
        emoji,
    } = opts;

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
    });

    const id = interaction.options.getString(itemType);
    const targetMessage = interaction.options.getString("message_id");
    const targetUser = interaction.options.getUser("reply_user");

    void logs.logMessage(
        `${itemType.toUpperCase()}: sending requested message in ${interaction.channel}.`
    );

    const found = items.find((o) => o.id === id);
    if (!found) return;

    const content = block(emoji ?? "", found.title, found.description);

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