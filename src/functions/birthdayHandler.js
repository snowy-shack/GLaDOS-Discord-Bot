const {
    EmbedBuilder,
  } = require("discord.js");

const database = require("../database");
const logs     = require("../logs");
const guild    = require("../guild");
const skinForm    = require("./skinFormHandler");
const styledEmbed = require("./styledEmbed");

const skins    = require("../consts/gun_skins");
const emojis   = require("../consts/emojis");

function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function checkBirthdays() {
    const client = await require("../client");
    birthdays = await database.getBirthdaysToday() || [];

    logs.logMessage(`🎂 There are ${birthdays.length} birthday(s) today.`);

    for (const discord_id of birthdays) {
        await (async () => {
            logs.logMessage(`🎉 It's \`<@${discord_id}>\`'s birthday!`);
            
            skinForm.sendFormMessage(await guild.getUser(discord_id), -1, skins.Birthday); // Start a DM form

            const channel = await client.channels.fetch(process.env.EXCLUSIVE_CHANNEL_ID);
            const happy_birthday = styledEmbed(
                `Hey! If our data is correct, that means today is your birthday 🍰!\n\nThe Enrichment Center would like to, on behalf of the **Phanty's Home server** & **PortalMod team**, say: \n# CONGRATULATIONS!!! 🎉\nMake sure to make today a lovely day! ${emojis.like}`, 
                "birthday • yay", 
                "Phanty's Home Birthdays"
            );

            channel.send({ content: `<@${discord_id}>`, embeds: [happy_birthday] });
            await wait(600000);
        })();
    }
}

module.exports = { checkBirthdays }