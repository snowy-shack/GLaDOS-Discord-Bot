import {Client, Events} from "discord.js";
import {setUserField, userFields} from "#src/modules/localStorage.mts";
import * as messageHandler from "#src/events/bridges/messageHandler.mts";
import * as logs from "#src/core/logs.mts";
import {toError} from "#src/core/try-catch.mts";
import {handleSkinCode} from "#src/modules/skinCodeHandler.mts";

export function init(client: Client): void {
    client.on(Events.MessageCreate, async (message) => {
        void handleSkinCode(message);
        if (message.author.bot) return;

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
