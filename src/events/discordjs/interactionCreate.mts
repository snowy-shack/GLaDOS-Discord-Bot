import {Client, Events} from "discord.js";
import commandHandler from "#src/bridges/commandHandler.mjs";
import buttonHandler from "#src/bridges/buttonHandler.mjs";
import modalHandler from "#src/bridges/modalHandler.mjs";
import * as logs from "#src/modules/logs.mjs";

export function init(client: Client): void {
    client.on(Events.InteractionCreate, async interaction => {
        try {
            if (interaction.isCommand())     await commandHandler.reply(interaction);
            if (interaction.isButton())      await buttonHandler.reply(interaction);
            if (interaction.isModalSubmit()) await modalHandler.reply(interaction);

        } catch (error: any) {
            await logs.logError("handling interaction", error);
        }
    });
}