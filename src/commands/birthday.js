const {
  ActionRowBuilder,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  EmbedBuilder,
  TextInputStyle,
} = require("discord.js");

const logs     = require("../logs");
const database = require("../database");
const colors   = require("../consts/colors");

function init() {
    return new SlashCommandBuilder()
        .setName("birthday")
        .setDescription("View and save birthdays")
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription("Add your birthday")
        )
        .addSubcommand(subcommand => subcommand
            .setName('get')
            .setDescription("Get someone's birthday")
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user whose birthday you want to see')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('next')
            .setDescription("See the next birthday(s)")
            .addIntegerOption(option => option
                .setName('count')
                .setDescription('The number of birthdays to view')
                .setMinValue(1).setMaxValue(10)
            )
        )
}

const emojiIcons = {
    home:   'https://portalmod.net/images/icons/home.png',
    mark:   'https://portalmod.net/images/icons/mark.png',
    events: 'https://portalmod.net/images/icons/events.png',
}

const formTitle = {
  name: "Phanty's Home Birthdays",
  iconURL: emojiIcons.home
};

// Form
const form = new ModalBuilder()
    .setCustomId("commands.birthday#birthday")
    .setTitle(formTitle.name);

const birthdayInput = new TextInputBuilder()
    .setCustomId("birthday")
    .setLabel("Enter your birthday: (This is permanent!)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("DD-MM-YYYY or DD-MM")
    .setRequired(true)
    .setMaxLength(10);

form.addComponents(new ActionRowBuilder().addComponents(birthdayInput));

// Cap a string str at len length
function trimString(str, len) {
    return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

// Returns Date from "dd-mm[-yyyy]" format
function parseDate(input) {
    const matches = input.match(/^(\d{2})-(\d{2})(?:-(\d{4}))?$/);
    if (!matches) return null;

    let [_, day, month, year] = matches;
    day   = parseInt(day);
    month = parseInt(month);
    year  = year ? parseInt(year) : 0;
    
    const date = new Date(year, month - 1, day);

    if (date.getDate() != day || date.getMonth() != month - 1) return null;
    date.setHours(12, 0, 0, 0); // Fix off by one?

    return date;
}

// Returns date in human-readable format
function formatDate(date, includeYear) {
    const months = ["January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"];

    const day   = date.getDate();
    const month = months[date.getMonth()];
    const year  = date.getFullYear();

    const suffix = 
        (day % 10 === 1 && day !== 11) ? "st" :
        (day % 10 === 2 && day !== 12) ? "nd" :
        (day % 10 === 3 && day !== 13) ? "rd" : "th";

    return (year === 1900 || !includeYear) ? `${month} ${day}${suffix}` : `${month} ${day}${suffix} ${year}`;
}

// Returns true if today is the input date
function birthdayIsToday(date) {
    const today = new Date();
    return date.getDate()  === today.getDate() &&
           date.getMonth() === today.getMonth();
}

// Returns the number of days until the input birthday
function daysUntilBirthday(birthday) {
    const today = new Date();
    const birthdayMonth = birthday.getMonth();
    const birthdayDay   = birthday.getDate();
    
    let nextBirthday = new Date(today.getFullYear(), birthdayMonth, birthdayDay);

    // If birthday has passed, adjust to next year
    if (today > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return Math.ceil((nextBirthday - today) / 86400000); // Divide by number of ms per day
}

// Format row details
async function getUserDetails(users) {
    const usernames     = [];
    const dates         = [];
    const daysRemaining = [];
    let lastMember;

    const guild   = await require("../guild");
    for (const user of users) {
        try {
            const member = await guild.members.fetch(user.discord_id);
            if (member && !lastMember) lastMember = member;

            const displayName   = member.nickname || member.user.globalName;
            const formattedDate = formatDate(user.birthday, false);
            const remainingDays = daysUntilBirthday(user.birthday);

            usernames.push(trimString(displayName, 20));
            dates.push(formattedDate);
            daysRemaining.push(remainingDays);
        } catch {}
    }

    return { usernames, dates, daysRemaining, lastMember };
}

async function react(interaction) {
    // Birthday Add command
    if (interaction.options.getSubcommand() == 'add') {
        const userBirthday = await database.getBirthday(interaction.user.id);

        if (!userBirthday) {
            await interaction.showModal(form);
            return;
        }
        
        const reply = new EmbedBuilder()
            .setColor(colors.Error)
            .setAuthor(formTitle)
            .setDescription(`You already have your birthday set to **${formatDate(userBirthday, true)}**! For the time being, **you can't change your birthday**. If you made a mistake, please DM **\`@phantomeye\`**`)
            .setFooter({ text: `birthday • duplicate` })
            .setThumbnail(emojiIcons.mark)
            .setTimestamp();
                
        await interaction.reply({ embeds: [ reply ] });
        return;
    }

    // Birthday Get command
    if (interaction.options.getSubcommand() == 'get') {
        const birthdayUser = interaction.options.getUser('user');
        const userBirthday = await database.getBirthday(birthdayUser.id);

        let reply = new EmbedBuilder()
            .setColor(colors.Error)
            .setAuthor(formTitle)
            .setDescription(`@${birthdayUser.displayName} doesn't seem to have a birthday saved! You can tell them to add one with **\`/birthday add\`**.`)
            .setFooter({ text: `birthday • not found` })
            .setThumbnail(birthdayUser.displayAvatarURL())
            .setTimestamp();
            
        if (userBirthday) {
            reply = new EmbedBuilder()
                .setColor(colors.Primary)
                .setAuthor(formTitle)
                .setDescription(
                    `@${birthdayUser.displayName}'s birthday is in **${daysUntilBirthday(userBirthday)} days**!\n## ${birthdayIsToday(userBirthday) ? "Today! 🎉" : formatDate(userBirthday, true) }`)
                .setFooter({ text: `birthday • success` })
                .setThumbnail(birthdayUser.displayAvatarURL())
                .setTimestamp();
        }

        await interaction.reply({ embeds: [ reply ] });
        return;
    }

    // Birthday next command
    if (interaction.options.getSubcommand() == 'next') {
        birthdayCount = interaction.options.getInteger('count') || 1;
        nextBirthdays = await database.getNextBirthdays(birthdayCount);

        entries = await getUserDetails(nextBirthdays);

        let reply = new EmbedBuilder()
            .setColor(colors.Primary)
            .setAuthor(formTitle)
            .setDescription(`Here's the upcoming **${entries.usernames.length}** next birthdays! \n_ _\n_ _`)
            .addFields({ name: '**Name:**',      value: `**\`\`\`\n${entries.usernames.join('\n')    }\n\`\`\`**`, inline: true })
            .addFields({ name:   'Date:',        value:   `\`\`\`\n${entries.dates.join('\n')        }\n\`\`\``,   inline: true })
            .addFields({ name:   'Days left:',   value:   `\`\`\`\n${entries.daysRemaining.join('\n')}\n\`\`\``,   inline: true })
            .setFooter({ text: `birthday • next ${entries.usernames.length}` })
            .setThumbnail(emojiIcons.home)
            .setTimestamp();

        let url = emojiIcons.mark;
        try { 
            url = entries.lastMember.displayAvatarURL();
        } catch {}

        if (birthdayCount == 1) {
            reply = new EmbedBuilder()
                .setColor(colors.Primary)
                .setAuthor(formTitle)
                .setDescription(
                    `The next birthday is @${entries.usernames[0]}'s, in **${entries.daysRemaining[0]} days**!\n## ${entries.daysRemaining[0] == 0 ? "Today! 🎉" : entries.dates[0] }`)
                .setFooter({ text: `birthday • success` })
                .setThumbnail(url)
                .setTimestamp();
        }

        await interaction.reply({ embeds: [ reply ] });
        return;
    }
}

async function modalSubmitted(formID, interaction) {
    if (formID == "birthday") {

        const birthDate = await parseDate(interaction.fields.getTextInputValue('birthday'));

        let reply = new EmbedBuilder()
            .setColor(colors.Error)
            .setAuthor(formTitle)
            .setDescription(`I wasn't able to understand that answer! Please enter your birthday in the **\`dd-mm[-yyyy]\`** format, and make sure **it's a valid date**!`)
            .setFooter({ text: `birthday • incorrect format` })
            .setThumbnail(emojiIcons.mark)
            .setTimestamp();

        // Valid input
        if (birthDate) {
            logs.logMessage(`🍰 Saved birthday of \`${interaction.user}\`: ${formatDate(birthDate, true)}`)
            
            database.saveBirthday(interaction.user.id, birthDate)

            reply = new EmbedBuilder()
                .setColor(colors.Calendar)
                .setAuthor(formTitle)
                .setDescription(`Successfully saved your birthday as **${formatDate(birthDate, true)}**! I will start on preparations for baking the cake!`)
                .setFooter({ text: `birthday • success` })
                .setThumbnail(emojiIcons.events)
                .setTimestamp();
        }
    
        interaction.reply({ embeds: [ reply ] });
    }
}

module.exports = { react, init, modalSubmitted };
