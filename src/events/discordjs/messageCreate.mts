import {Client, Events} from "discord.js";
import {flags, setFlag} from "#src/agents/flagAgent.mjs";
import * as messageHandler from "#src/bridges/messageHandler.mjs";
import * as logs from "#src/modules/logs.mjs";
import {WORDLE_APP_ID} from "#src/functions/autoResponses.mts";

export function init(client: Client): void {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot && message.author.id != WORDLE_APP_ID) return;

        void setFlag(message.author.id, flags.Ghost, "false");

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
