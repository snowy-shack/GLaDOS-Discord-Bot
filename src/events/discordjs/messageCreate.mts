import {Client, Events} from "discord.js";
import {userFields, setUserField} from "#src/modules/localStorage.mts";
import * as messageHandler from "#src/events/bridges/messageHandler.mts";
import * as logs from "#src/core/logs.mts";
import {WORDLE_APP_ID} from "#src/modules/autoResponses.mts";

export function init(client: Client): void {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot && message.author.id != WORDLE_APP_ID) return;

        void setUserField(message.author.id, userFields.Ghost, "false");

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
