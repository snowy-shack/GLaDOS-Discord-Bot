import * as logs from "#src/core/logs.mts";
import colors from "#src/consts/colors.mts";
import * as localizedStrings from "#src/modules/localizedStrings.mts";
import {GuildMember, MessageCreateOptions} from "discord.js";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import {channels, dmUser, rolesMarkDown} from "#src/core/phantys_home.mts";
import {getChannel} from "#src/core/discord.mts";

export async function spamKick(member: GuildMember, reason: string, initiator?: GuildMember) {
    await dmUser(member.user, embedMessage({
        body: await localizedStrings.string("server.notification.spam_kicked"),
        footer: "spam",
        title: "Snowy Shack Spam prevention",
        color: colors.Error
    }));

    try {
        await member.ban({
            deleteMessageSeconds: 86400, // Deletes messages from the last 24 hours
            reason: `Suspected spam or hacked account - reason: ${reason}`
        });
        await member.guild.bans.remove(member.id, "Instant unban for hacked user");

        const mod_chat = await getChannel(channels.ModeratorChat);
        if (mod_chat?.isSendable()) {
            const who = initiator ? `${initiator} (\`${initiator.id}\`)` : "GLaDOS";
            await mod_chat.send({
                content: rolesMarkDown.Moderator,
                ...embedMessage<MessageCreateOptions>({
                    body: `${who} spam-kicked ${member} (\`${member.id}\`)\nReason: \`${reason}\``,
                    footer: "spam",
                    title: "Snowy Shack Spam prevention",
                    color: colors.Error
                })
            });
        }

        await logs.logMessage(`👋 Spam kicked ${member} - Reason: ${reason}.`);
        return true;
    } catch (error) {
        await logs.logMessage(`❌ Could not kick ${member}.`);
        return false;
    }
}