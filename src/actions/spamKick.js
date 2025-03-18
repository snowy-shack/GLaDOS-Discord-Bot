import * as logs from "#src/modules/logs";
import * as discord from "#src/modules/discord";
import * as styledEmbed from "#src/factories/styledEmbed";
import colors from "#src/consts/colors";
import * as stringAgent from "#src/agents/stringAgent";

export async function spamKick(member, reason) {
    try {
        await member.user.send(styledEmbed.embedMessageObject(
            await stringAgent.string("server.notification.spam_kicked"),
            "spam",
            "Phanty's Home Spam prevention",
            colors.Error
        ));
    } catch (error) {
        await logs.logMessage("❌ Could not notify user about the kick")
    }

    try {
        await member.kick({ reason: `Suspected spam or hacked account - reason: ${reason}` });

        await logs.logMessage(`👋 Spam kicked ${member} - Reason: ${reason}.`);

        return true;
    } catch (error) {
        await logs.logMessage(`❌ Could not kick ${member}.`);

        return false;
    }
}