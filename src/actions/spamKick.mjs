import * as logs from "#src/modules/logs.mjs";
import * as styledEmbed from "#src/factories/styledEmbed.mjs";
import colors from "#src/consts/colors.mts";
import * as stringAgent from "#src/agents/stringAgent.mjs";

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