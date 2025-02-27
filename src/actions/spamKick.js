import * as logs from "#src/modules/logs";
import * as discord from "#src/modules/discord";
import * as styledEmbed from "#src/factories/styledEmbed";
import colors from "#src/consts/colors";
import * as stringAgent from "#src/agents/stringAgent";

export async function spamKick(userID, manual) {
    const member = await discord.getMember(userID);

    try {
        await member.send(styledEmbed.message(
            await stringAgent.string("server.notification.spam_kicked"),
            "spam",
            "Phanty's Home Spam prevention",
            colors.Error
        ));
    } catch (error) {
        await logs.logMessage("❌ Could not notify user about the kick")
    }

    try {
        await member.kick({
            reason: `Suspected spam or hacked account - ${manual ? "manual" : "automated"}`
        });
        await logs.logMessage(`👋 Spam kicked \`<@${userID}>\`.`);

        return true;
    } catch (error) {
        await logs.logMessage(`❌ Could not kick \`<@${userID}>\`.`);

        return false;
    }
}