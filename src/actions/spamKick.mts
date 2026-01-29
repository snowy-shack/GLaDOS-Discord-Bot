import * as logs from "#src/core/logs.mts";
import colors from "#src/consts/colors.mts";
import * as localizedStrings from "#src/modules/localizedStrings.mts";
import {GuildMember} from "discord.js";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import {dmUser} from "#src/core/phantys_home.mts";

export async function spamKick(member: GuildMember, reason: string) {
    await dmUser(member.user, embedMessage({
        body: await localizedStrings.string("server.notification.spam_kicked"),
        footer: "spam",
        title: "Phanty's Home Spam prevention",
        color: colors.Error
    }));

    try {
        await member.kick(`Suspected spam or hacked account - reason: ${reason}`);
        await logs.logMessage(`👋 Spam kicked ${member} - Reason: ${reason}.`);
        return true;
    } catch (error) {
        await logs.logMessage(`❌ Could not kick ${member}.`);
        return false;
    }
}