import { embed } from "#src/factories/styledEmbed.mts";
import { gun_skins as skins } from "#src/consts/gun_skins.mts";
import { channels } from "#src/modules/phantys_home.mts";
import { emojis } from "#src/modules/phantys_home.mts";
import * as logs from "#src/modules/logs.mts";
import * as guild from "#src/modules/discord.mts";
import * as skinForm from "#src/functions/skinFormHandler.mts";
import * as util from "#src/modules/util.mts";
import {flags, getAllFlagValues} from "#src/agents/flagAgent.mts";
import {getChannel} from "#src/modules/discord.mts";
import {dateToString} from "#src/modules/util.mts";
import {GuildMember} from "discord.js";
import {string} from "#src/agents/stringAgent.mjs";

export async function checkBirthdays() {
    const today = dateToString(new Date()).split("-").slice(0, 2).join("-"); // "dd-mm"
    const birthdays = (await getAllFlagValues(flags.Birthday.Date))
        .filter(item => item.value.split("-").slice(0, 2).join("-") === today) // Check if it's today
        .map(item => item.user);

    await logs.logMessage(`🎂 There are ${birthdays.length} birthday(s) today.`);

    const channel = await getChannel(channels.General);
    if (!channel || !channel.isTextBased()) return;

    for (const discord_id of birthdays) {
        await (async () => {
            await logs.logMessage(`🎉 It's <@${discord_id}>'s birthday!`);

            const guildMember: GuildMember | undefined = await guild.getMember(discord_id);
            if (!guildMember) return;

            await skinForm.sendFormMessage(guildMember.user, 0, undefined, skins.Birthday.id); // Start a DM form

            const happy_birthday = embed(
                await string("birthday.notification"),
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