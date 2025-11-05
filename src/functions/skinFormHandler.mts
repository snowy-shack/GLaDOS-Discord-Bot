import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    User,
    Message,
    ButtonInteraction, APIEmbed
} from "discord.js";
import * as minecraft from "#src/modules/minecraft.mts";
import "#src/envloader.mts";

import colors from "#src/consts/colors.mts";
import * as logs from "#src/modules/logs.mts";
import { embedMessage } from "#src/factories/styledEmbed.mts";
import { string, templateString } from "#src/agents/stringAgent.mts";
import { getChannel } from "#src/modules/discord.mts";
import { channels, dmUser } from "#src/modules/phantys_home.mts";
import { icons } from "#src/consts/icons.mts";

const title = "PortalMod Portal Gun skin form";

export async function respond(previousField: number | null, fieldValue: string, type: string = "blank"): Promise<APIEmbed[] | undefined> {
    switch (previousField) {
        case 0: {
            return [
                embedMessage({
                    body: await string(`skins.form.intro.${type}`),
                    footer: `field 1/2 • skin.${type}`,
                    title
                })
            ];
        }

        case 1: {
            const minecraftUser = await minecraft.getAccount(fieldValue);
            const uuid = minecraftUser.uuid;
            const username = minecraftUser.username;

            if (!(/^[\w-]+$/.test(fieldValue)) || fieldValue.length <= 2 || fieldValue.length >= 17) {
                return [
                    embedMessage({
                        body: await string("skins.form.username.error"),
                        footer: `field 1/2 • skin.${type} • syntax error`,
                        title
                    })
                ];
            }

            if (uuid) {
                const form_profile = embedMessage<APIEmbed>({
                    color: colors.Secondary,
                    thumbnail: minecraft.getSkin(uuid),
                    body: `# ${username}\n(\`UUID: ${uuid}\`)`,
                });
                return [
                    embedMessage({
                        body: await string("skins.form.confirm"),
                        footer: `field 2/2 • skin.${type}`,
                        title
                    }),
                    form_profile
                ];
            }

            return [
                embedMessage({
                    body: await templateString("skins.form.username.unknown", [fieldValue]),
                    footer: `field 1/2 • skin.${type} • not found`,
                    title
                })
            ];
        }

        case 2: {
            switch (fieldValue) {
                case "confirm":
                    return [
                        embedMessage({
                            body: await string("skins.form.finished"),
                            footer: "form complete",
                            title
                        })
                    ];
                case "change":
                    return [
                        embedMessage({
                            body: await string("skins.form.confirm.change"),
                            footer: `field 1/2 • skin.${type} • reset`,
                            title
                        })
                    ];
                default:
                    return [
                        embedMessage({
                            body: await string("skins.form.confirm.error"),
                            footer: `field 2/2 • skin.${type} • syntax error`,
                            title
                        })
                    ];
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

    const form_failed = embedMessage<APIEmbed>({
        body: await templateString("skins.form.fail", [targetUser.username, type]),
        footer: `skin.${type} • DM error (50007)`,
        title
    });

    const retry = new ButtonBuilder()
        .setCustomId('functions.skinFormHandler#retry')
        .setLabel(`Retry`)
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Secondary);

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(retry);

    channel.send({ content: `${targetUser}`, embeds: [form_failed], components: [buttons] });
}

export function skinTypeFromFooter(message: Message): string | undefined {
    const embed = message.embeds[0];
    const footer = embed.data?.footer?.text;
    return footer?.split("skin.")[1]?.split(' ')[0];
}

export async function buttonPressed(buttonID: string, interaction: ButtonInteraction) {
    if (!interaction.message.content.includes(interaction.user.id)) {
        await interaction.deferUpdate();
        return;
    }

    const skinType = skinTypeFromFooter(interaction.message);

    switch (buttonID) {
        case "retry": {
            if (await sendFormMessage(interaction.user, 0, undefined, skinType, true)) {
                await interaction.message.delete();
            } else {
                await interaction.reply(
                    embedMessage({
                        body: await string("skins.form.fail.again"),
                        footer: `skin.${skinType} • message error`,
                        title,
                        color: colors.Error,
                        ephemeral: true,
                        thumbnail: icons.mark
                    })
                );
            }
        }
    }
}
