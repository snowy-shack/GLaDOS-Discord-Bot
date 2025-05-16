import {Client, Events} from "discord.js";
import {flags, getFlag, setFlag} from "#src/agents/flagAgent.mjs";
import * as messageHandler from "#src/bridges/messageHandler.mjs";
import * as logs from "#src/modules/logs.mjs";

export function init(client: Client): void {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        let wasGhost = await getFlag(message.author.id, flags.Ghost);
        if (wasGhost) void setFlag(message.author.id, flags.Ghost, "false");

        try {
            if (message.guild) {
                await messageHandler.handleMessage(message);
            } else {
                await messageHandler.handleDM(message);
            }
        } catch (error: any) {
            await logs.logError(`handling ${message.guild ? "guild" : "DM"} message by <@${message.author.id}>`, error);
        }
    });
}
