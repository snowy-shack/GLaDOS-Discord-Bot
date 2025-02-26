import * as logs from "#src/modules/logs";
import * as discord from "#src/modules/discord";
import * as styledEmbed from "#src/factories/styledEmbed";
import colors from "#src/consts/colors";
import * as stringAgent from "#src/agents/stringAgent";

export async function spamKick(userID) {
    await logs.logMessage(`Spam kicking \`<@${userID}>\`.`);

    const user = await discord.getUser(userID);

    user.send(styledEmbed.message(
            await stringAgent.string("server.notification.spam_kicked"),
            "spam",
            "Phanty's Home Spam prevention",
            colors.Error
    ));
}