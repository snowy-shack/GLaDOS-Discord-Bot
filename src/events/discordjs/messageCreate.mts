import {Client, Events} from "discord.js";
import {setUserField, userFields} from "#src/modules/localStorage.mts";
import * as messageHandler from "#src/events/bridges/messageHandler.mts";
import * as logs from "#src/core/logs.mts";
import {toError} from "#src/core/try-catch.mts";
import {WORDLE_APP_ID} from "#src/modules/autoResponses.mts";
import {check} from "#src/modules/coreModule.mts";

export function init(client: Client): void {
    client.on(Events.MessageCreate, async (message) => {
        void check(message);
        if (message.author.bot && message.author.id != WORDLE_APP_ID) return;

        void setUserField(message.author.id, userFields.Ghost, "false");

        try {
            if (message.guild) {
                await messageHandler.handleMessage(message);
            } else {
                await messageHandler.handleDM(message);
            }
        } catch (error: unknown) {
            await logs.logError(`handling ${message.guild ? "guild" : "DM"} message by <@${message.author.id}>`, toError(error));
        }
    });
}
