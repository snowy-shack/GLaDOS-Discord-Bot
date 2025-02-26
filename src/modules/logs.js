import { getGuild } from "#src/modules/discord";

/* private */ async function getLogChannel() {
    const guild = await getGuild();
    return await guild.channels.fetch(process.env.LOG_CHANNEL_ID.toString());
}
/**
 *
 * @param message Unformatted raw text.
 * @returns {string} Formatted text with quote and monospace.
 */
export function formatMessage(message) {
    return '> **\`' + message.replace('\n', ' ') + '\`**';
}

export async function logMessage(message) {
    const logChannel = await getLogChannel();
    await logChannel.send(formatMessage(message));
}

export async function directReply(message, response) {
    await message.reply(formatMessage(response.replace(/\n/g, " ")));
}

export async function logError(location, error) {
    console.error("Error occurred " + location + error.message);

    try {
        const logChannel = await getLogChannel();
        await logChannel.send(formatMessage(`❌ An error occurred ${location}: ${error.code} - ${error.message.trim()}`));
    } catch (error) {
        console.error("An error occurred logging the error. Ironic.");
    }
}