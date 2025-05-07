import {
    ActionRowBuilder, SlashCommandBuilder, ModalBuilder,
    TextInputBuilder, TextInputStyle, ChatInputCommandInteraction, ModalSubmitInteraction,
} from "discord.js";

import * as logs from "#src/modules/logs.mts";
import colors from "#src/consts/colors.mts";
import { getMember } from "#src/modules/discord.mts";
import {InteractionReplyEmbed} from "#src/factories/styledEmbed.mts";
import {string, templateString} from "#src/agents/stringAgent.mts";
import {flags, getAllFlagValues, getFlag, setFlag} from "#src/agents/flagAgent.mts";
import {dateIsToday, DAY_IN_MS, formatDate, isValidDate, sortDatesUpcoming, trimString} from "#src/modules/util.mts";

export function init() {
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

const title = "Phanty's Home Birthdays";
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

form.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(birthdayInput));

// Returns the number of days until the input birthday
function daysUntilBirthday(date: string) {
    const today = new Date();

    const [day, month] = date.split('-').map(Number);

    let nextBirthday = new Date(today.getFullYear(), month - 1, day);

    // If the birthday has already passed this year, move it to next year
    if (today > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return Math.ceil((Number(nextBirthday) - Number(today)) / DAY_IN_MS); // Convert ms to days
}

// Format row details
async function getUserDetails(users: { [key: string]: string }[]) {
    const usernames     = [];
    const dates         = [];
    const daysRemaining = [];
    let lastMember;

    for (const entry of users) {
        let ghost = await getFlag(entry.user, flags.Ghost);
        if (ghost) continue;
        try {
            const member = await getMember(entry.user);

            if (!member) continue;

            if (!lastMember) lastMember = member;

            const displayName = (member.nickname || member.user.globalName) ?? "Unknown";
            const formattedDate = formatDate(entry.value, false);
            const remainingDays = daysUntilBirthday(entry.value);

            usernames.push(trimString(displayName, 20));
            dates.push(formattedDate);
            daysRemaining.push(remainingDays);
        } catch (error: any) {
            await logs.logError("indexing birthdays", error)
        }
    }

    return { usernames, dates, daysRemaining, lastMember };
}

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        // Birthday Add command
        case "add": {
            const userBirthday = await getFlag(interaction.user.id, flags.Birthday.Date);

            if (!userBirthday) {
                await interaction.showModal(form);
                return;
            }

            void interaction.reply(InteractionReplyEmbed(
                await templateString("birthday.add.duplicate", [ formatDate(userBirthday, true) ]),
                "birthday • duplicate",
                title,
                colors.Error,
                true
            ));
        } break;

        // Birthday Get command
        case "get": {
            await interaction.deferReply();

            const birthdayUser = interaction.options.getUser("user");
            if (!birthdayUser) return;

            const userBirthday = await getFlag(birthdayUser.id, flags.Birthday.Date);

            if (userBirthday) {
                await interaction.editReply({
                    ...InteractionReplyEmbed(
                    await templateString("birthday.get.success", [
                        `<@${birthdayUser.id}>`,
                        String(daysUntilBirthday(userBirthday) % 365),
                        dateIsToday(userBirthday) ? "Today! 🎉" : formatDate(userBirthday, true)
                    ]),
                    "birthday • success",
                    title,
                    colors.Primary,
                    false,
                    birthdayUser.displayAvatarURL()
                ),
                flags: undefined
            });

            } else {
                await interaction.editReply({
                    ...InteractionReplyEmbed(
                        await templateString("birthday.get.unknown", [`<@${birthdayUser.id}>`]),
                        "birthday • not found",
                        title,
                        colors.Primary,
                        false,
                        birthdayUser.displayAvatarURL()
                    ),
                    flags: undefined
                });
            }
        } break;


        // Birthday next command
        case "next": {
            await interaction.deferReply();

            const users = await getAllFlagValues(flags.Birthday.Date);
            const users_sorted = sortDatesUpcoming(users);

            const birthdayCount = interaction.options.getInteger("count") || 1;

            const userEntries = await getUserDetails(users_sorted);

            // Single birthday
            if (birthdayCount === 1) {
                let url:  string|undefined = emojiIcons.mark;
                let name: string|undefined = userEntries.usernames[0];
                try {
                    url = userEntries.lastMember?.displayAvatarURL();
                    name = `<@${userEntries.lastMember?.id}>`;
                } catch {}

                await interaction.editReply({
                    ...InteractionReplyEmbed(
                        await templateString(
                            "birthday.next.single",
                            [name, String(userEntries.daysRemaining[0]), userEntries.daysRemaining[0] === 0 ? "Today! 🎉" : userEntries.dates[0]]
                        ),
                        "birthday • success",
                        title,
                        colors.Primary,
                        false,
                        url
                    ),
                    flags: undefined
                });
            // Multiple birthdays
            } else {
                let nr = Math.min(birthdayCount, userEntries.usernames?.length ?? 10);

                await interaction.editReply({
                    ...InteractionReplyEmbed(
                        await templateString("birthday.next.multiple", [nr]),
                        `birthday • next ${birthdayCount}`,
                        title,
                        colors.Primary,
                        false,
                        emojiIcons.home,
                        [
                            { name: '**Name:**',      value: `**\`\`\`\n${userEntries.usernames.slice(0, birthdayCount).join('\n')    }\n\`\`\`**`, inline: true },
                            { name:   'Date:',        value:   `\`\`\`\n${userEntries.dates.slice(0, birthdayCount).join('\n')        }\n\`\`\``,   inline: true },
                            { name:   'Days left:',   value:   `\`\`\`\n${userEntries.daysRemaining.slice(0, birthdayCount).join('\n')}\n\`\`\``,   inline: true }
                        ]
                    ),
                    flags: undefined
                });
            }
        } break;
    }
}

export async function modalSubmitted(formID: string, interaction: ModalSubmitInteraction) {
    if (formID === "birthday") {
        let birthDate = interaction.fields.getTextInputValue('birthday');

        const matches = birthDate.match(/^(\d{2})-(\d{2})(?:-(\d{4}))?$/);

        if (matches) {
            let [_, day, month, year] = matches;
            year = year && /^\d{4}$/.test(year) ? year : "1900"; // Default to 1900 if missing/invalid

            // Convert to numbers
            const dayNum = parseInt(day, 10);
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);

            // Check whether the date is valid
            birthDate = isValidDate(dayNum, monthNum, yearNum) ? `${day}-${month}-${year}` : "";
        } else {
            birthDate = "";
        }

        // Valid input
        if (birthDate) {
            await setFlag(interaction.user.id, flags.Birthday.Date, birthDate);
            void logs.logMessage(`🍰 Saved birthday of ${interaction.user}: ${formatDate(birthDate, true)}`);

            await interaction.reply(InteractionReplyEmbed(
                await templateString("birthday.add.success", [formatDate(birthDate, true)]),
                "birthday • success",
                title,
                colors.Calendar,
                false,
                emojiIcons.events
            ));

        } else {
            await interaction.reply(InteractionReplyEmbed(
                await string("birthday.add.syntax"),
                "birthday • incorrect format",
                title,
                colors.Error,
                true,
                emojiIcons.mark
            ));
        }
    }
}
