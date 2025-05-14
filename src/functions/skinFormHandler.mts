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
import {channels, dmUser} from "#src/modules/phantys_home.mts";

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
    const succeeded = await dmUser(targetUser, { embeds: await respond(previousField, textInput, type) });
    if (succeeded) return true;

    if (retried || succeeded === null) return false;

    const channel = await getChannel(channels.General);
    if (!channel || !channel.isTextBased()) return false;

    void logs.logMessage(`🔁 Asking ${targetUser} to DM them in ${channel}.`);

    const form_failed = embed(
        await templateString("skins.form.fail",
            [
                targetUser.username,
                type
            ]
        ),
        `skin.${type} • DM error (${50007})`, // Error: "Cannot send messages to this user"
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