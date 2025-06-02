import {GuildMember, TextChannel} from "discord.js";
import {flags, getFlag, setFlag} from "#src/agents/flagAgent.mjs";
import {DAY_IN_MS} from "#src/modules/util.mjs";
import logs from "#src/modules/logs.mjs";
import {channels, dmUser, rolesMarkDown} from "#src/modules/phantys_home.mjs";
import {embed, MessageReplyEmbed} from "#src/factories/styledEmbed.mjs";
import * as stringAgent from "#src/agents/stringAgent.mjs";
import colors from "#src/consts/colors.mjs";
import {getChannel} from "#src/modules/discord.mjs";


export async function userLockup(member: GuildMember, channel: TextChannel|null, message: string|null = null) {
    try {
        const alreadyLockedUp = await getFlag(member.user.id, flags.Security.LockedUp);
        if (alreadyLockedUp) return;

        // Mark the user as locked up
        await setFlag(member.user.id, flags.Security.LockedUp, "true");

        // Auto-release the user after 6 hours
        await member.timeout(DAY_IN_MS / 4, "Suspicious URL detected");
        setTimeout(() => userUnlock(member), DAY_IN_MS / 4);

        void logs.logWarning(`🚫Locked up user ${member}`);

        await dmUser(member.user, MessageReplyEmbed(
            await stringAgent.string("server.notification.locked_up"),
            "spam",
            "Phanty's Home Spam prevention",
            colors.Error
        ));

        const mod_chat = await getChannel(channels.ModeratorChat);
        if (channel && mod_chat?.isSendable()) {
            await mod_chat.send({
                content: `${rolesMarkDown.Moderator}`,
                embeds: [embed(
                    await stringAgent.templateString("server.security.user_locked_up", [
                        member.user.id,
                        channel.id,
                        `${(new Date().getTime() / 1000 + DAY_IN_MS / 4 / 1000).toFixed(0)}`,
                        message ?? "  * unknown *  "
                    ]),
                    "spam",
                    "Phanty's Home Spam prevention",
                    colors.Error,
                )]
            });
        }

    } catch (error: any) {
        await logs.logError("locking user", error);
    }
}

export async function userUnlock(member: GuildMember) {
    await setFlag(member.user.id, flags.Security.LockedUp, "false");
}