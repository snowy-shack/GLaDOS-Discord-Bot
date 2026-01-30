import {GuildMember, MessageCreateOptions, TextChannel} from "discord.js";
import {userFields, getUserField, setUserField} from "#src/modules/localStorage.mts";
import {DAY_IN_MS} from "#src/core/util.mts";
import logs from "#src/core/logs.mts";
import {channels, dmUser, rolesMarkDown} from "#src/core/phantys_home.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import * as localizedStrings from "#src/modules/localizedStrings.mts";
import colors from "#src/consts/colors.mts";
import {getChannel} from "#src/core/discord.mts";

export async function userLockup(member: GuildMember, channel: TextChannel|null, message: string|null = null) {
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
            title: "Phanty's Home Spam prevention",
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
                    title: "Phanty's Home Spam prevention",
                    color: colors.Error
                })
            });
        }

    } catch (error: any) {
        await logs.logError("locking user", error);
    }
}

export async function userUnlock(member: GuildMember) {
    await setUserField(member.user.id, userFields.Security.LockedUp, "false");
}
