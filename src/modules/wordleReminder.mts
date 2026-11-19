import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, MessageCreateOptions} from "discord.js";
import * as logs from "#src/core/logs.mts";
import {toError} from "#src/core/try-catch.mts";
import {daysSince} from "#src/core/util.mts";
import {env} from "#src/core/env.mts";
import {getChannel, getMember} from "#src/core/discord.mts";
import {channels, roles, rolesMarkDown} from "#src/core/phantys_home.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";
import {getFieldForAllUsers, getGlobalField, getUserField, globalFields, userFields} from "#src/modules/localStorage.mts";

const WORDLE_IMAGE_BASE = "https://wordle.portalmod.net";
const RESULTS_IMAGE_NAME = "wordle-results.png";

// Memory-only, never persisted - who currently still needs a reminder today. We're the one adding
// and removing the Discord role in the first place, so there's no need to ask Discord who has it -
// especially on prod's ~9k-member guild, where that'd mean paging through everyone just to answer "anyone left?"
const pendingReminders = new Set<string>();

// Results image render takes ~2-3s and the API is allowed to fail - a missing image shouldn't block the ping
async function fetchResultsImage(date?: string): Promise<AttachmentBuilder | null> {
    try {
        const url = date
            ? `${WORDLE_IMAGE_BASE}/api/results-image?date=${date}`
            : `${WORDLE_IMAGE_BASE}/api/results-image`;

        // Beta gets its own image-only token so it can't take over the /ws/bot bridge from prod - falls back to the shared one for prod
        const token = env.WORDLE_IMAGE_TOKEN ?? env.WORDLE_WS_TOKEN;
        const res = await fetch(url, {headers: {Authorization: `Bearer ${token}`}});
        if (!res.ok) throw new Error(`Wordle results image ${url} -> ${res.status}`);

        const buffer = Buffer.from(await res.arrayBuffer());
        return new AttachmentBuilder(buffer, {name: RESULTS_IMAGE_NAME});
    } catch (error) {
        await logs.logError("fetching wordle results image", toError(error));
        return null;
    }
}

function yesterdayIsoDate(): string {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

// Discord doesn't support custom button colors - Secondary (gray) is the closest to "dark"
function playButtonRow() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("commands.wordle#play")
            .setLabel("Play!")
            .setStyle(ButtonStyle.Secondary)
    );
}

function subscriberIds(): string[] {
    return getFieldForAllUsers(userFields.Wordle.ReminderEnabled)
        .filter(entry => entry.value)
        .map(entry => entry.user);
}

// Hands the reminder role to every subscriber and resets who's still pending for the new day - solving removes them from both
async function addReminderRoleToSubscribers() {
    try {
        pendingReminders.clear();
        for (const id of subscriberIds()) {
            pendingReminders.add(id);
            const member = await getMember(id);
            if (member && !member.roles.cache.has(roles.WordleReminders)) {
                await member.roles.add(roles.WordleReminders);
            }
        }
    } catch (error) {
        await logs.logError("adding wordle reminder role", toError(error));
    }
}

// Called once someone finishes a game - they don't need the reminder role nagging them today anymore
async function handleSolved(discordId: string) {
    pendingReminders.delete(discordId);
    try {
        const member = await getMember(discordId);
        if (member?.roles.cache.has(roles.WordleReminders)) {
            await member.roles.remove(roles.WordleReminders);
        }
    } catch (error) {
        await logs.logError("removing wordle reminder role", toError(error));
    }
}

function getPendingReminderIds(): string[] {
    return [...pendingReminders];
}

// Everyone who solved yesterday, bucketed by attempt count - mentions here don't actually ping, embeds never do
function buildResultLines(): string {
    const buckets: Record<number, string[]> = {1: [], 2: [], 3: [], 4: [], 5: [], 6: []};

    for (const {user, value: lastPlayed} of getFieldForAllUsers(userFields.Wordle.LastPlayed)) {
        if (daysSince(lastPlayed) !== 1) continue;

        const score = getUserField(user, userFields.Wordle.LastScore);
        if (score >= 1 && score <= 6) buckets[score].push(`<@${user}>`);
    }

    const lines = Object.entries(buckets)
        .filter(([, names]) => names.length > 0)
        .map(([attempts, names]) => `${attempts}/6: ${names.join(", ")}`);

    return lines.length > 0 ? lines.join("\n") : "Nobody played yesterday.";
}

async function sendDailyReminder() {
    try {
        if (pendingReminders.size === 0) return;

        const streak = getGlobalField(globalFields.Wordle.ServerStreak) ?? 0;
        const resultLines = buildResultLines();
        const image = await fetchResultsImage(yesterdayIsoDate());

        const body = `## Current server streak: \`${streak} 🔥\`\n**Yesterday's results:**\n${resultLines}`;

        const channel = await getChannel(channels.Arcade);
        if (channel && "send" in channel) {
            // The role mention in content is what actually pings people - mentions inside an embed don't
            await channel.send({
                content: rolesMarkDown.WordleReminders,
                components: [playButtonRow()],
                files: image ? [image] : [],
                ...embedMessage<MessageCreateOptions>({
                    body,
                    color: colors.Primary,
                    image: image ? `attachment://${RESULTS_IMAGE_NAME}` : null,
                }),
            });
        }
    } catch (error) {
        await logs.logError("sending wordle reminder", toError(error));
    }
}

const STREAK_WARNING_THRESHOLD = 5;

async function sendStreakWarning() {
    try {
        const atRisk = subscriberIds()
            .map(user => ({user, streak: getUserField(user, userFields.Wordle.Streak) ?? 0}))
            .filter(({streak}) => streak > STREAK_WARNING_THRESHOLD)
            .sort((a, b) => b.streak - a.streak);

        if (atRisk.length === 0) return;

        const lines = atRisk.map(({user, streak}) => `<@${user}> ${streak} day streak`);
        const body = "## Last chance to refresh wordle streaks!\n" + lines.join("\n");
        const image = await fetchResultsImage();

        const channel = await getChannel(channels.Arcade);
        if (channel && "send" in channel) {
            // The role mention in content is what actually pings people - mentions inside an embed don't
            await channel.send({
                content: rolesMarkDown.WordleReminders,
                components: [playButtonRow()],
                files: image ? [image] : [],
                ...embedMessage<MessageCreateOptions>({
                    body,
                    color: colors.Primary,
                    image: image ? `attachment://${RESULTS_IMAGE_NAME}` : null,
                }),
            });
        }
    } catch (error) {
        await logs.logError("sending wordle streak warning", toError(error));
    }
}

export default {sendDailyReminder, sendStreakWarning, addReminderRoleToSubscribers, handleSolved, getPendingReminderIds};
