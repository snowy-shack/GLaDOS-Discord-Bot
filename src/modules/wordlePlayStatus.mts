import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, EmbedBuilder, GuildMember, Message} from "discord.js";
import * as logs from "#src/core/logs.mts";
import {toError} from "#src/core/try-catch.mts";
import {getChannel, getMember} from "#src/core/discord.mts";
import {channels, guildID} from "#src/core/phantys_home.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";
import {fetchPlayerImage} from "#src/modules/wordleImages.mts";
import {playButtonRow} from "#src/commands/wordle.mts";
import {getUserField, userFields} from "#src/modules/localStorage.mts";

const PLAYER_IMAGE_NAME = "wordle-player.png";

// Memory-only - the "is playing" message to turn into "was playing" once they finish. Lost on
// restart, in which case finishing just posts a fresh "was playing" message instead of editing one.
const activeGames = new Map<string, Message>();

// No `flags` field, unlike MessageCreateOptions/MessageEditOptions - so this satisfies both .send() and .edit()
type PlayStatusPayload = {
    content: string;
    components: ActionRowBuilder<ButtonBuilder>[];
    files: AttachmentBuilder[];
    embeds: EmbedBuilder[];
};

// The Wordle server has no bot token, so without these it only knows an avatar once the player has a record for today
function imageFor(discordId: string, member: GuildMember | undefined) {
    return fetchPlayerImage(discordId, {
        guildId: guildID,
        displayName: member?.displayName,
        avatarHash: member?.user.avatar,
        guildAvatarHash: member?.avatar,
    }, PLAYER_IMAGE_NAME);
}

function buildPayload(discordId: string, member: GuildMember | undefined, verb: "is" | "was", image: AttachmentBuilder | null): PlayStatusPayload {
    const streak = getUserField(discordId, userFields.Wordle.Streak) ?? 0;
    let body = `## <@${discordId}> ${verb} playing\nCurrent streak: \`${streak} 🔥\``;

    if (verb === "was") {
        const lastScore = getUserField(discordId, userFields.Wordle.LastScore) ?? 0;
        body += lastScore >= 1 ? `\nSolved in: \`${lastScore}/6\`` : `\nFailed. Streak broken`;
    }

    return {
        content: "",
        components: [playButtonRow()],
        files: image ? [image] : [],
        ...embedMessage<{embeds: EmbedBuilder[]}>({
            body,
            color: colors.Primary,
            thumbnail: member?.displayAvatarURL() ?? null,
            image: image ? `attachment://${PLAYER_IMAGE_NAME}` : null,
        }),
    };
}

// A fresh game almost certainly has no record yet, so this image usually comes back the fallback-avatar empty board
async function announceStarted(discordId: string) {
    if (activeGames.has(discordId)) return;

    try {
        const channel = await getChannel(channels.Arcade);
        if (!channel || !("send" in channel)) return;

        const member = await getMember(discordId);
        const image = await imageFor(discordId, member);
        const message = await channel.send(buildPayload(discordId, member, "is", image));
        activeGames.set(discordId, message);
    } catch (error) {
        await logs.logError("announcing wordle game started", toError(error));
    }
}

async function announceFinished(discordId: string) {
    try {
        const member = await getMember(discordId);
        const image = await imageFor(discordId, member);
        const payload = buildPayload(discordId, member, "was", image);

        const existing = activeGames.get(discordId);
        activeGames.delete(discordId);

        if (existing) {
            await existing.edit({...payload, attachments: []});
            return;
        }

        const channel = await getChannel(channels.Arcade);
        if (channel && "send" in channel) await channel.send(payload);
    } catch (error) {
        await logs.logError("announcing wordle game finished", toError(error));
    }
}

export default {announceStarted, announceFinished};
