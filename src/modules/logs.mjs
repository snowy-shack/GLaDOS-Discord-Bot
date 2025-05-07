import {getChannel} from "#src/modules/discord.mjs";
import {channels} from "#src/consts/phantys_home.mjs";
import {embedMessageObject, embedObject} from "#src/factories/styledEmbed.mjs";
import colors from "#src/consts/colors.mts";

/* private */ async function getLogChannel() {
    return await getChannel(channels.Logs);
}
/**
 *
 * @param message Unformatted raw text.
 * @returns {string} Formatted text with quote and monospace.
 */
export function formatMessage(message) {
    // return '> **\`' + message.replace('\n', ' ') + '\`**';
    return embedMessageObject(`**${message}**`, "", "", colors.Primary);
}

export async function logWarning(message) {
    console.log(`[WARN]: ${message}`);
    const logChannel = await getLogChannel();

    await logChannel.send(embedMessageObject(`**${message}**`, "", "", colors.Warning));
}

export async function logMessage(message) {
    console.log(`[LOGS]: ${message}`);

    const logChannel = await getLogChannel();
    await logChannel.send(embedMessageObject(`**${message}**`, "", "", colors.Success));
}

export async function logError(location, error) {
    console.error(`Error occurred ${location}: ${error.message}`);

    try {
        const logChannel = await getLogChannel(); // v @PhantomEye
        await logChannel.send({content: "<@382524802491219969>", embeds: [embedObject(`**${error.message}**`, "", "", colors.Error)]});
    } catch (error) {
        console.error("An error occurred logging the error. Ironic.");
    }
}