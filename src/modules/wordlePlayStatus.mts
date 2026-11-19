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

// Memory-only - one play status message per player per day. Entries stay until the midnight clear, so
// a player gets at most one "is playing" post a day, edited into "was playing" exactly once. Lost on
// restart, in which case finishing just posts a fresh "was playing" message instead of editing one.
type PlayStatusEntry = { message: Promise<Message | null>; finished: boolean };
const activeGames = new Map<string, PlayStatusEntry>();

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

async function sendToArcade(payload: PlayStatusPayload): Promise<Message | null> {
    const channel = await getChannel(channels.Arcade);
    if (!channel || !("send" in channel)) return null;
    return channel.send(payload);
}

// A fresh game almost certainly has no record yet, so this image usually comes back the fallback-avatar empty board
function announceStarted(discordId: string) {
    if (activeGames.has(discordId)) return;

    // Registered synchronously so a second /wordle play while this one is still sending can't post a duplicate
    const message = (async () => {
        const member = await getMember(discordId);
        const image = await imageFor(discordId, member);
        return sendToArcade(buildPayload(discordId, member, "is", image));
    })().catch(async (error: unknown) => {
        await logs.logError("announcing wordle game started", toError(error));
        return null;
    });

    activeGames.set(discordId, {message, finished: false});
}

async function announceFinished(discordId: string) {
    const entry = activeGames.get(discordId);
    if (entry?.finished) return;

    const message = entry?.message ?? Promise.resolve(null);
    // Kept in the map (not deleted) so neither a new "is playing" nor another "was playing" goes out today
    activeGames.set(discordId, {message, finished: true});

    try {
        const member = await getMember(discordId);
        const image = await imageFor(discordId, member);
        const payload = buildPayload(discordId, member, "was", image);

        const existing = await message;
        if (existing) {
            await existing.edit({...payload, attachments: []});
            return;
        }

        await sendToArcade(payload);
    } catch (error) {
        await logs.logError("announcing wordle game finished", toError(error));
    }
}

// Reset at the Wordle day boundary, so each player can get a new play status message for the new day
function clearActiveGames() {
    activeGames.clear();
}

export default {announceStarted, announceFinished, clearActiveGames};
