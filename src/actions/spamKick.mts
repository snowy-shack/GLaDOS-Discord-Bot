import * as logs from "#src/modules/logs.mts";
import colors from "#src/consts/colors.mts";
import * as stringAgent from "#src/agents/stringAgent.mts";
import {GuildMember} from "discord.js";
import {embedMessage} from "#src/factories/styledEmbed.mts";
import {dmUser} from "#src/modules/phantys_home.mjs";

export async function spamKick(member: GuildMember, reason: string) {
    await dmUser(member.user, embedMessage({
        body: await stringAgent.string("server.notification.spam_kicked"),
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