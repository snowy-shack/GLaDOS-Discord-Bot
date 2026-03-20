import { channels, rolesMarkDown } from "#src/core/phantys_home.mts";
import { embedMessage } from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";
import { MessageCreateOptions, TextChannel, WebhookClient } from "discord.js";
import chalk from "chalk";
import { isSilent } from "#src/envloader.mts";
import { getChannel } from "#src/core/discord.mts";

type Sender = {
    name: string,
    getSender: () => Promise<TextChannel | WebhookClient>,
}

export function formatMessage<T>(message: string): T {
    return embedMessage({
        body: `**${message}**`,
        footer: "",
        title: "",
        color: colors.Primary
    }) as T;
}

const warningLogger = (s: Sender) => async (msg: string) => {
    if (isSilent) return;
    console.log(chalk.red(`[WARN]: ${msg}`));
    const target = await s.getSender();
    await target.send({
        username: s.name,
        content: rolesMarkDown.Developer,
        ...embedMessage<MessageCreateOptions>({ body: `**${msg}**`, color: colors.Warning })
    });
};

const messageLogger = (s: Sender) => async (msg: string) => {
    if (isSilent) return;
    console.log(chalk.blueBright(`[LOGS]: ${msg}`));
    const target = await s.getSender();
    await target.send({
        username: s.name,
        ...embedMessage<MessageCreateOptions>({ body: `**${msg}**`, color: s.name === "GLaDOS" ? colors.Success : colors.Inactive })
    });
};

const errorLogger = (s: Sender) => async (loc: string, err: Error) => {
    if (isSilent) return;
    console.error(chalk.red(`Error @ ${loc}: ${err.message}`));
    const target = await s.getSender();
    const body = `Error @ ${loc} - **\`${err.message}\`**\n\`\`\`\n${err.stack || "No stack"}\n\`\`\``;
    await target.send({
        username: s.name,
        content: rolesMarkDown.Developer,
        ...embedMessage<MessageCreateOptions>({ title: "An error occurred", body, color: colors.Error })
    });
};

const gladosSender: Sender = {
    name: "GLaDOS",
    getSender: async () => {
        const chan = await getChannel(channels.Logs);
        if (!(chan instanceof TextChannel)) throw new Error('Invalid Log Channel');
        return chan;
    }
};

const webhookSender: Sender = {
    name: "Central Core",
    getSender: async () => {
        if (!process.env.WEBHOOK) throw new Error('No Webhook URL');
        return new WebhookClient({ url: process.env.WEBHOOK });
    }
};

export const glados = {
    logWarning: warningLogger(gladosSender),
    logMessage: messageLogger(gladosSender),
    logError: errorLogger(gladosSender)
};

export const webhook = {
    logWarning: (msg: string) => warningLogger(webhookSender)('⚙️ ' + msg),
    logMessage: (msg: string) => messageLogger(webhookSender)('⚙️ ' + msg),
    logError: errorLogger(webhookSender),
};

export const { logWarning, logMessage, logError } = glados;
export default glados;