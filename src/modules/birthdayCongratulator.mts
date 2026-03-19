import {templateEmbed} from "#src/formatting/styledEmbed.mts";
import { channels } from "#src/core/phantys_home.mts";
import { emojis } from "#src/core/phantys_home.mts";
import * as logs from "#src/core/logs.mts";
import * as guild from "#src/core/discord.mts";
import * as skinForm from "#src/modules/skinFormHandler.mts";
import { dateIsToday, delayInMinutes } from "#src/core/util.mts";
import { userFields, getFieldForAllUsers, getUserField } from "#src/modules/localStorage.mts";
import { getChannel } from "#src/core/discord.mts";
import {GuildMember} from "discord.js";
import {string} from "#src/modules/localizedStrings.mts";
import {KNOWN_SKINS} from "#src/modules/portalGunSkinLoader.mts";

export async function checkBirthdays() {
    const birthdays = (await getFieldForAllUsers(userFields.Birthday.Date))
        .filter(item => dateIsToday(item.value))
        .map(item => item.user);

    await logs.logMessage(`🎂 There are ${birthdays.length} birthday(s) today.`);

    const channel = await getChannel(channels.General);
    if (!channel || !channel.isTextBased()) return;

    for (const discord_id of birthdays) {
        await (async () => {
            await logs.logMessage(`🎉 It's <@${discord_id}>'s birthday!`);

            const guildMember: GuildMember | undefined = await guild.getMember(discord_id);
            if (!guildMember || getUserField(guildMember.id, userFields.Birthday.Unlocked)) return;

            await skinForm.sendFormMessage(guildMember.user, 0, undefined, KNOWN_SKINS.Birthday); // Start a DM form

            const happy_birthday = templateEmbed({
                body: await string("birthday.notification"),
                footer: "birthday • yay",
                title: "Phanty's Home Birthdays"
            });

            await channel.send({ content: `<@${discord_id}>`, embeds: [happy_birthday] })
                .then(message => message.react(emojis.Tada));

            await delayInMinutes(10);
        })();
    }
}

export default { checkBirthdays }