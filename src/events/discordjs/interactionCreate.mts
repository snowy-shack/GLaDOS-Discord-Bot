import {Client, Events} from "discord.js";
import commandHandler from "#src/events/bridges/commandHandler.mts";
import buttonHandler from "#src/events/bridges/buttonHandler.mts";
import modalHandler from "#src/events/bridges/modalHandler.mts";
import * as logs from "#src/core/logs.mts";
import { toError } from "#src/core/try-catch.mts";

export function init(client: Client): void {
    client.on(Events.InteractionCreate, async interaction => {
        try {
            if (interaction.isCommand())     await commandHandler.reply(interaction);
            if (interaction.isButton())      await buttonHandler.reply(interaction);
            if (interaction.isModalSubmit()) await modalHandler.reply(interaction);
        } catch (error: unknown) {
            const err = toError(error);
            if (err.message.includes("Unknown interaction")) return;
            await logs.logError("handling interaction", err);
        }
    });
}