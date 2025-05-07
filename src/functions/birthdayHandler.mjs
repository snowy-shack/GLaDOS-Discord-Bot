import { embedObject } from "#src/factories/styledEmbed";
import { gun_skins as skins } from "#src/consts/gun_skins";
import { channels } from "#src/consts/phantys_home";
import { emojis } from "#src/consts/phantys_home";
import * as logs from "#src/modules/logs";
import * as guild from "#src/modules/discord";
import * as skinForm from "#src/functions/skinFormHandler";
import * as util from "#src/modules/util";
import {flags, getAllFlagValues} from "#src/agents/flagAgent";
import {getChannel} from "#src/modules/discord";
import {dateToString} from "#src/modules/util";

export async function checkBirthdays() {
    const today = dateToString(new Date()).split("-").slice(0, 2).join("-"); // "dd-mm"
    const birthdays = (await getAllFlagValues(flags.Birthday.Date))
        .filter(item => item.value.split("-").slice(0, 2).join("-") === today) // Check if it's today
        .map(item => item.user);

    await logs.logMessage(`🎂 There are ${birthdays.length} birthday(s) today.`);

    const channel = await getChannel(channels.General);
    for (const discord_id of birthdays) {
        await (async () => {
            await logs.logMessage(`🎉 It's <@${discord_id}>'s birthday!`);
            
            await skinForm.sendFormMessage(await guild.getMember(discord_id), 0, undefined, skins.Birthday.id); // Start a DM form

            const happy_birthday = embedObject(
                `Hey! If our data is correct, that means today is your birthday 🍰!\n\nThe Enrichment Center would like to, on behalf of the **Phanty's Home server** & **PortalMod team**, say: \n# CONGRATULATIONS!!! 🎉\nMake sure to make today a lovely day! ${emojis.Like}`,
                "birthday • yay", 
                "Phanty's Home Birthdays"
            );

            await channel.send({ content: `<@${discord_id}>`, embeds: [happy_birthday] })
                .then(message => message.react(emojis.Tada));

            await util.delayInMinutes(10);
        })();
    }
}

export default { checkBirthdays }