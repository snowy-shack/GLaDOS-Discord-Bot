import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, GuildMember, MessageCreateOptions, TextChannel} from "discord.js";
import {getUserField, setUserField, userFields} from "#src/modules/localStorage.mts";
import {spamKick} from "#src/actions/spamKick.mts";
import {greenlightDomain} from "#src/modules/spamAllowlist.mts";
import {DAY_IN_MS} from "#src/core/util.mts";
import logs from "#src/core/logs.mts";
import {channels, dmUser, rolesMarkDown} from "#src/core/phantys_home.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import * as localizedStrings from "#src/modules/localizedStrings.mts";
import colors from "#src/consts/colors.mts";
import {getChannel} from "#src/core/discord.mts";
import {toError} from "#src/core/try-catch.mts";

export async function userLockup(member: GuildMember, channel: TextChannel|null, message: string|null = null, flaggedLink: string|null = null) {
    try {
        const alreadyLockedUp = getUserField(member.user.id, userFields.Security.LockedUp);
        if (alreadyLockedUp) return;

        // Mark the user as locked up
        await setUserField(member.user.id, userFields.Security.LockedUp, "true");

        // Auto-release the user after 6 hours
        await member.timeout(DAY_IN_MS / 4, "Suspicious URL detected");
        setTimeout(() => userUnlock(member), DAY_IN_MS / 4);

        void logs.logWarning(`🚫Locked up user ${member}`);

        await dmUser(member.user, embedMessage({
            body: await localizedStrings.string("server.notification.locked_up"),
            footer: "spam",
            title: "Snowy Shack Spam prevention",
            color: colors.Error
        }));

        const mod_chat = await getChannel(channels.ModeratorChat);
        if (channel && mod_chat?.isSendable()) {
            await mod_chat.send({
                content: `${rolesMarkDown.Moderator}`,
                ...embedMessage<MessageCreateOptions>({
                    body: await localizedStrings.templateString("server.security.user_locked_up", [
                        member.user.id,
                        channel.id,
                        `${(new Date().getTime() / 1000 + DAY_IN_MS / 4 / 1000).toFixed(0)}`,
                        message ?? "  * unknown *  "
                    ]),
                    footer: "spam",
                    title: "Snowy Shack Spam prevention",
                    color: colors.Error
                })
            });
            if (flaggedLink && mod_chat?.isSendable()) {
                const domain = flaggedLink.replace(/(?:https?:\/\/)?(?:www\.)?/, '').split('/')[0];

                const greenlight = new ButtonBuilder()
                    .setCustomId(`actions.userLockup#greenlight:${member.user.id}:${domain}`)
                    .setLabel('Greenlight link')
                    .setStyle(ButtonStyle.Success);

                const unlock = new ButtonBuilder()
                    .setCustomId(`actions.userLockup#unlock:${member.user.id}:${domain}`)
                    .setLabel('Unlock user')
                    .setStyle(ButtonStyle.Secondary);

                const kick = new ButtonBuilder()
                    .setCustomId(`actions.userLockup#kick:${member.user.id}:${domain}`)
                    .setLabel('Spam-kick user')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(greenlight, unlock, kick);

                await mod_chat.send({
                    content: `The link that was flagged:\n> ${flaggedLink}`,
                    components: [row],
                });
            }
        }

    } catch (error: unknown) {
        await logs.logError("locking user", toError(error));
    }
}

export async function userUnlock(member: GuildMember) {
    await setUserField(member.user.id, userFields.Security.LockedUp, "false");
}

export async function buttonPressed(buttonID: string, interaction: ButtonInteraction) {
    const [action, userId, domain] = buttonID.split(':');

    await interaction.deferReply({ ephemeral: true });
    await interaction.message.edit({ components: [] });

    switch (action) {
        case 'greenlight': {
            await greenlightDomain(domain);
            await interaction.editReply(`✅ Domain \`${domain}\` greenlisted — it won't be flagged again.`);
            break;
        }
        case 'unlock': {
            const member = await interaction.guild?.members.fetch(userId).catch(() => null);
            if (!member) { await interaction.editReply('❌ Could not find user.'); break; }
            await userUnlock(member);
            await interaction.editReply(`✅ Unlocked <@${userId}>.`);
            break;
        }
        case 'kick': {
            const member = await interaction.guild?.members.fetch(userId).catch(() => null);
            if (!member) { await interaction.editReply('❌ Could not find user — they may have already left.'); break; }
            const success = await spamKick(member, 'Moderator action via button');
            await interaction.editReply(success ? `✅ Spam-kicked <@${userId}>.` : `❌ Could not kick <@${userId}>.`);
            break;
        }
    }
}
