import * as database from "#src/modules/database";
import * as logs from "#src/modules/logs";
import * as guild from "#src/modules/discord";
import * as skinForm from "#src/functions/skinFormHandler";
import * as styledEmbed from "#src/factories/styledEmbed";
import * as skins from "#src/consts/gun_skins";
import emojis from "#src/consts/emojis";
import * as util from "#src/modules/util";

async function checkBirthdays() {
    const client = await import("#src/modules/client");
    const birthdays = await database.getBirthdaysToday() || [];

    await logs.logMessage(`🎂 There are ${birthdays.length} birthday(s) today.`);

    for (const discord_id of birthdays) {
        await (async () => {
            await logs.logMessage(`🎉 It's \`<@${discord_id}>\`'s birthday!`);
            
            await skinForm.sendFormMessage(await guild.getMember(discord_id), 0, skins.Birthday); // Start a DM form

            const channel = await client.channels.fetch(process.env.EXCLUSIVE_CHANNEL_ID);
            const happy_birthday = styledEmbed(
                `Hey! If our data is correct, that means today is your birthday 🍰!\n\nThe Enrichment Center would like to, on behalf of the **Phanty's Home server** & **PortalMod team**, say: \n# CONGRATULATIONS!!! 🎉\nMake sure to make today a lovely day! ${emojis.like}`, 
                "birthday • yay", 
                "Phanty's Home Birthdays"
            );

            channel.send({ content: `<@${discord_id}>`, embeds: [happy_birthday] });
            await util.wait(600000);
        })();
    }
}

export default { checkBirthdays }