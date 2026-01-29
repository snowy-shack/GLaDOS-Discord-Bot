import {templateEmbed} from "#src/formatting/styledEmbed.mts";
import { gun_skins as skins } from "#src/consts/gun_skins.mts";
import { channels } from "#src/core/phantys_home.mts";
import { emojis } from "#src/core/phantys_home.mts";
import * as logs from "#src/core/logs.mts";
import * as guild from "#src/core/discord.mts";
import * as skinForm from "#src/modules/skinFormHandler.mts";
import * as util from "#src/core/util.mts";
import {flags, getAllFlagValues, getFlag} from "#src/modules/localStorage.mts";
import {getChannel} from "#src/core/discord.mts";
import {dateToString} from "#src/core/util.mts";
import {GuildMember} from "discord.js";
import {string} from "#src/modules/localizedStrings.mts";

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
            if (!guildMember || await getFlag(guildMember.id, flags.Birthday.Unlocked)) return;

            await skinForm.sendFormMessage(guildMember.user, 0, undefined, skins.Birthday.id); // Start a DM form

            const happy_birthday = templateEmbed({
                body: await string("birthday.notification"),
                footer: "birthday • yay",
                title: "Phanty's Home Birthdays"
            });

            await channel.send({ content: `<@${discord_id}>`, embeds: [happy_birthday] })
                .then(message => message.react(emojis.Tada));

            await util.delayInMinutes(10);
        })();
    }
}

export default { checkBirthdays }