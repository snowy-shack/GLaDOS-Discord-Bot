import {MessageCreateOptions} from "discord.js";
import * as logs from "#src/core/logs.mts";
import {toError} from "#src/core/try-catch.mts";
import {daysSince} from "#src/core/util.mts";
import {getChannel, getMember} from "#src/core/discord.mts";
import {channels, guildID, roles, rolesMarkDown} from "#src/core/phantys_home.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";
import {getFieldForAllUsers, getGlobalField, getUserField, globalFields, userFields} from "#src/modules/localStorage.mts";
import {fetchResultsImage} from "#src/modules/wordleImages.mts";
import {playButtonRow} from "#src/commands/wordle.mts";

const RESULTS_IMAGE_NAME = "wordle-results.png";

// Memory-only, never persisted - who currently still needs a reminder today. We're the one adding
// and removing the Discord role in the first place, so there's no need to ask Discord who has it -
// especially on prod's ~9k-member guild, where that'd mean paging through everyone just to answer "anyone left?"
const pendingReminders = new Set<string>();

function yesterdayIsoDate(): string {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
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
        const image = await fetchResultsImage(guildID, yesterdayIsoDate());

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
        const body = "## Last chance to refresh wordle streaks!\n" + lines.join("\n"
                + "\n-# Use `/wordle reminder on|off` to change your reminder preferences");

        const image = await fetchResultsImage(guildID);

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
