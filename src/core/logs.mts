import { getChannel } from "#src/core/discord.mts";
import { channels, rolesMarkDown } from "#src/core/phantys_home.mts";
import { embedMessage } from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";
import {GuildBasedChannel, MessageCreateOptions} from "discord.js";
import chalk from "chalk";
import {isSilent} from "#src/envloader.mts";

/* private */ async function getLogChannel(): Promise<GuildBasedChannel | null | undefined> {
    return await getChannel(channels.Logs);
}

export function formatMessage<T>(message: string): T {
    return embedMessage({
        body: `**${message}**`,
        footer: "",
        title: "",
        color: colors.Primary
    }) as T;
}

export async function logWarning(message: string) {
    if (isSilent) return;

    console.log(chalk.red(`[WARN]: ${message}`));
    const logChannel = await getLogChannel();
    if (!logChannel || !logChannel.isTextBased()) return;

    await logChannel.send({
        content: rolesMarkDown.Developer,
        ...embedMessage<MessageCreateOptions>({
            body: `**${message}**`,
            footer: "",
            title: "",
            color: colors.Warning
        })
    });
}

export async function logMessage(message: string) {
    if (isSilent) return;

    console.log(chalk.blueBright(`[LOGS]: ${message}`));
    const logChannel = await getLogChannel();
    if (!logChannel || !logChannel.isTextBased()) return;

    await logChannel.send(
        embedMessage({
            body: `**${message}**`,
            footer: "",
            title: "",
            color: colors.Success
        })
    );
}

export async function logError(location: string, error: Error) {
    if (isSilent) return;

    console.error(`Error occurred ${location}: ${error.message}`);

    try {
        const logChannel = await getLogChannel();
        if (!logChannel || !logChannel.isTextBased()) return;

        let formattedError = `Error occurred ${location} - **\`${error.message}\`**`;
        formattedError += ` \n \`\`\` \n${error.stack || "No stack trace available"}\n\`\`\``;

        await logChannel.send({
            content: rolesMarkDown.Developer,
            ...embedMessage<MessageCreateOptions>({
                body: formattedError,
                footer: "",
                title: "An error occurred",
                color: colors.Error
            })
        });

    } catch (error) {
        console.error("An error occurred logging the above error. Ironic. Cause below");
        console.error(error);
    }
}

export default { logWarning, logMessage, logError };
