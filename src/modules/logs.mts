import {getChannel} from "#src/modules/discord.mts";
import {channels, rolesMarkDown} from "#src/modules/phantys_home.mts";
import {embed, InteractionReplyEmbed, MessageReplyEmbed} from "#src/factories/styledEmbed.mjs";
import colors from "#src/consts/colors.mts";
import {GuildBasedChannel} from "discord.js";
import chalk from "chalk";

/* private */ async function getLogChannel(): Promise<GuildBasedChannel | null | undefined> {
    return await getChannel(channels.Logs);
}

export function FormatMessageReplyEmbed(message: string) {
    return MessageReplyEmbed(`**${message}**`, "", "", colors.Primary);
}

export function FormatInteractionReplyEmbed(message: string) {
    return InteractionReplyEmbed(`**${message}**`, "", "", colors.Primary);
}

export async function logWarning(message: string) {
    console.log(chalk.red(`[WARN]: ${message}`));
    const logChannel = await getLogChannel();
    if (!logChannel || !logChannel.isTextBased()) return;

    await logChannel.send(MessageReplyEmbed(`**${message}**`, "", "", colors.Warning));
}

export async function logMessage(message: string) {
    console.log(chalk.blueBright(`[LOGS]: ${message}`));

    const logChannel = await getLogChannel();
    if (!logChannel || !logChannel.isTextBased()) return;

    await logChannel.send(MessageReplyEmbed(`**${message}**`, "", "", colors.Success));
}

export async function logError(location: string, error: Error) {
    console.error(`Error occurred ${location}: ${error.message}`);

    try {
        const logChannel = await getLogChannel();
        if (!logChannel || !logChannel.isTextBased()) return;

        let formattedError = `Error occurred ${location} - **\`${error.message}\`**`;
        formattedError += ` \n \`\`\` \n${error.stack || "No stack trace available"}\n\`\`\``;

        await logChannel.send({content: rolesMarkDown.Developer, embeds: [
            embed(formattedError, "", "An error occurred", colors.Error)
        ]});

    } catch (error) {
        console.error("An error occurred logging the following error. Ironic.");
        console.error(error);
    }
}

export default { logWarning, logMessage, logError };