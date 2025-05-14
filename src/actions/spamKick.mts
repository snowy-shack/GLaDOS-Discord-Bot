import * as logs from "#src/modules/logs.mts";
import colors from "#src/consts/colors.mts";
import * as stringAgent from "#src/agents/stringAgent.mts";
import {GuildMember} from "discord.js";
import {MessageReplyEmbed} from "#src/factories/styledEmbed.mts";

export async function spamKick(member: GuildMember, reason: string) {
    try {
        await member.user.send(MessageReplyEmbed(
            await stringAgent.string("server.notification.spam_kicked"),
            "spam",
            "Phanty's Home Spam prevention",
            colors.Error
        ));
    } catch (error) {
        await logs.logMessage("❌ Could not notify user about the kick")
    }

    try {
        await member.kick(`Suspected spam or hacked account - reason: ${reason}`);

        await logs.logMessage(`👋 Spam kicked ${member} - Reason: ${reason}.`);

        return true;
    } catch (error) {
        await logs.logMessage(`❌ Could not kick ${member}.`);

        return false;
    }
}