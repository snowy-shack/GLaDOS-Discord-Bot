import {
    ChatInputCommandInteraction,
    HexColorString,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {all_flags, getUserData, removeFlag, setFlag} from "#src/modules/localStorage.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";

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

const flagsEmbedConfig = {
    footer: "flags",
    title: "Phanty's Home User data",
    color: colors.Primary as HexColorString
};

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {

        case "get": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key');
            if (!user) return;

            const data = await getUserData(user.id);

            if (key) {
                await interaction.reply(
                    embedMessage({
                        body: `User ${user} has the following value for flag \`${key}\`: \`${data[key]}\``,
                        ...flagsEmbedConfig
                    })
                );
                break;
            }

            await interaction.reply(
                embedMessage({
                    body: `User ${user} has the following flags:\n${
                        Object.entries(data)
                            .map(([key, value]) => `**\`${key}\`**: \`${value}\``)
                            .join("\n")
                    }`,
                    ...flagsEmbedConfig
                })
            );
        } break;

        case "set": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key');
            if (!user || !key) return;

            let value: any = interaction.options.getString('value') ?? true;
            const original = await getUserData(user.id);

            switch (value) {
                case "true": value = true; break;
                case "false": value = false; break;
                default: value = isNaN(value) ? value : +value;
            }

            await setFlag(user.id, key, value);

            const oldVal = original[key];

            const body = oldVal !== undefined
                ? `Set flag **\`${key}\`** for user ${user}:\n### from: \`${oldVal}\`\n### to: \`${value}\``
                : `Set flag **\`${key}\`** for user ${user}:\n### \`${value}\``;

            await interaction.reply(
                embedMessage({ body, ...flagsEmbedConfig })
            );
        } break;

        case "remove": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key');
            if (!user || !key) return;

            await removeFlag(user.id, key);

            await interaction.reply(
                embedMessage({
                    body: `Removed **\`${key}\`** flag from user ${user}`,
                    ...flagsEmbedConfig
                })
            );
        } break;
    }
}
