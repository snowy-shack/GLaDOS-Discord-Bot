import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {all_flags, getUserData, removeFlag, setFlag} from "#src/agents/flagAgent";
import {embedMessageObject} from "#src/factories/styledEmbed";
import colors from "#src/consts/colors";

export function init() {
    return new SlashCommandBuilder()
        .setName("flags")
        .setDescription("View and modify user flags")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand
            .setName('get')
            .setDescription("Get all flags of a given user")
            .addUserOption(option => option
                .setName('user')
                .setDescription("The user in question")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('key')
                .setDescription("The ID of the flag")
                .addChoices(...all_flags)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription("Set a user flag")
            .addUserOption(option => option
                .setName('user')
                .setDescription("The user in question")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('key')
                .setDescription("The ID of the flag")
                .addChoices(...all_flags)
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('value')
                .setDescription("The value for the flag")
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription("Remove a user flag")
            .addUserOption(option => option
                .setName('user')
                .setDescription("The user in question")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('key')
                .setDescription("The ID of the flag")
                .addChoices(...all_flags)
                .setRequired(true)
            )
        )
}

const flagsEmbedConfig = [
    /* footer: */ "flags",
    /* title: */  "Phanty's Home User data",
    /* color: */  colors.Primary,
]

export async function react(interaction) {
    switch (interaction.options.getSubcommand()) {
        // Flags get command
        case "get": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key');

            const data = await getUserData(user.id);

            if (key) {
                await interaction.reply(embedMessageObject(
                    `User ${user} has the following value for flag \`${key}\`: \`${data[key]}\``,
                    ...flagsEmbedConfig
                ));
                break;
            }

            await interaction.reply(embedMessageObject(
                `User ${user} has the following flags: \n${
                    Object.entries(data)
                        .map(([key, value]) => `**\`${key}\`**: \`${value}\``)
                        .join("\n")
                }`,
                ...flagsEmbedConfig
            ));
        } break;

        case "set": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key');

            let value = interaction.options.getString('value') ?? true;

            const original = await getUserData(user.id);

            switch (value) {
                case "true": value = true; break;
                case "false": value = false; break;
                default: value = isNaN(value) ? value : +value;
            } // Convert booleans and numbers

            await setFlag(user.id, key, value);

            if (original[key] !== undefined) {
                await interaction.reply(embedMessageObject(
                    `Set flag **\`${key}\`** for user ${user}: \n### from: \t\`${original[key]}\` \n### to: \`${value}\``,
                    ...flagsEmbedConfig
                ));
            } else {
                await interaction.reply(embedMessageObject(
                    `Set flag **\`${key}\`** for user ${user}: \n### \t\`${value}\``,
                    ...flagsEmbedConfig
                ));
            }
        } break;

        case "remove": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key');

            await removeFlag(user.id, key);

            await interaction.reply(embedMessageObject(
                `Removed **\`${key}\`** flag from user ${user}`,
                ...flagsEmbedConfig
            ));
        } break;
    }
}