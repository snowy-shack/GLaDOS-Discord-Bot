import {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    User,
    Message, ButtonInteraction
} from "discord.js";
import * as minecraft from "#src/modules/minecraft.mts";
import "#src/envloader.mts";

import colors from "#src/consts/colors.mts";
import * as logs from "#src/modules/logs.mts";
import { embed, InteractionReplyEmbed } from "#src/factories/styledEmbed.mts";
import { string, templateString } from "#src/agents/stringAgent.mts";
import {getChannel} from "#src/modules/discord.mts";
import {channels} from "#src/consts/phantys_home.mts";

const title = "PortalMod Portal Gun skin form";

export async function respond(previousField: number | null, fieldValue: string, type: string = "blank") {
    switch (previousField) {
        case 0: { // Send first form message if there hasn't been prior form messages.
            return [embed(await string(`skins.form.intro.${type}`), `field 1/2 • skin.${type}`, title)];
        }
        case 1: { // Username entered
            const minecraftUser = await minecraft.getAccount(fieldValue);
            const uuid = minecraftUser.uuid;
            const username = minecraftUser.username;

            if (!(/^[\w-]+$/.test(fieldValue)) || fieldValue.length <= 2 || fieldValue.length >= 17) { // Contains invalid characters
                return [embed(await string("skins.form.username.error"), `field 1/2 • skin.${type} • syntax error`, title)];

            } else if (uuid) {
                const form_profile = new EmbedBuilder().setColor(colors.Secondary)
                    .setThumbnail(minecraft.getSkin(uuid))
                    .setDescription(`# ${username}\n(\`UUID: ${uuid}\`)`);

                return [embed(await string("skins.form.confirm"), `field 2/2 • skin.${type}`, title), form_profile];
            } else {
                return [embed(await templateString("skins.form.username.unknown", [fieldValue]), `field 1/2 • skin.${type} • not found`, title)];
            }
        }
        case 2: { // Username confirmed
            switch (fieldValue) {
                case "confirm": return [embed(await string("skins.form.finished"), "form complete", title)];
                case "change":  return [embed(await string("skins.form.confirm.change"), `field 1/2 • skin.${type} • reset`, title)];
                default:        return [embed(await string("skins.form.confirm.error"), `field 2/2 • skin.${type} • syntax error`, title)];
            }
        }
    }
}

export async function sendFormMessage(targetUser: User, previousField: number, textInput = "", type = "", retried = false) {
    try {
        // throw { code: 50007, message: "Emulated DM error" };
        await targetUser.send({ embeds: await respond(previousField, textInput, type) });
        return true;

    } catch (error: any) { // Unable to DM
        if (error.code !== 50007) {
            console.error(error);
        }

        if (!retried) { // Error: "Cannot send messages to this user"
            void logs.logWarning(`🎭 Ran into an issue DM'ing ${targetUser}.`);

            const channel = await getChannel(channels.General);
            if (!channel || !channel.isTextBased()) return false;

            void logs.logMessage(`🔁 Asking them to retry in ${channel}.`);

            const form_failed = embed(
                await templateString("skins.form.fail",
                    [
                        targetUser.username,
                        type
                    ]
                ),
                `skin.${type} • DM error (${error.code})`,
                title
            );

            const retry = new ButtonBuilder()
                .setCustomId('functions.skinFormHandler#retry')
                .setLabel(`Retry`)
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Secondary);

            const buttons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(retry);

            channel.send({ content: `${targetUser}`, embeds: [form_failed], components: [buttons] });
            return false;
        }
    }
    return false;
}

export function skinTypeFromFooter(message: Message): string | undefined {
    const embed = message.embeds[0];
    const footer = embed.data?.footer?.text;
    return footer?.split("skin.")[1]?.split(' ')[0];
}

export async function buttonPressed(buttonID: string, interaction: ButtonInteraction) {
    // If the user isn't whom the message is directed towards
    if (!interaction.message.content.includes(interaction.user.id)) {
        await interaction.deferUpdate(); // This makes the button do nothing
        return;
    }

    const skinType = skinTypeFromFooter(interaction.message);

    switch (buttonID) {
        case "retry": {
            if (await sendFormMessage(interaction.user, 0, undefined, skinType, true)) {
                await interaction.message.delete();
            } else {
                await interaction.reply(InteractionReplyEmbed(await string("skins.form.fail.again"), `skin.${skinType} • message error`, title, colors.Error, true));
            }
        }
    }
}