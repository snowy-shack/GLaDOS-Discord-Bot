import {
    ChatInputCommandInteraction,
    HexColorString,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {
    all_fields,
    getUserData,
    getUserField,
    removeUserField,
    setUserField,
    userField
} from "#src/modules/localStorage.mts";
import {embedMessage} from "#src/formatting/styledEmbed.mts";
import colors from "#src/consts/colors.mts";

export function init() {
    return new SlashCommandBuilder()
        .setName("storage")
        .setDescription("View and modify user storage")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand
            .setName('get')
            .setDescription("Get all fields of a given user")
            .addUserOption(option => option
                .setName('user')
                .setDescription("The user in question")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('key')
                .setDescription("The key of the field")
                .addChoices(...all_fields)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription("Set a user field")
            .addUserOption(option => option
                .setName('user')
                .setDescription("The user in question")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('key')
                .setDescription("The key of the field")
                .addChoices(...all_fields)
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('data')
                .setDescription("The new data for the field")
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription("Remove a user field")
            .addUserOption(option => option
                .setName('user')
                .setDescription("The user in question")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('key')
                .setDescription("The ID of the field")
                .addChoices(...all_fields)
                .setRequired(true)
            )
        )
}

const storageEmbedConfig = {
    footer: "flags",
    title: "Phanty's Home User data",
    color: colors.Primary as HexColorString
};

export async function react(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {

        case "get": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key') as userField;
            if (!user) return;

            const data = getUserField(user.id, key);

            if (key) {
                await interaction.reply(
                    embedMessage({
                        body: `User ${user} has the following data for field \`${key}\`: \`${data}\``,
                        ...storageEmbedConfig
                    })
                );
                break;
            }

            const userData = getUserData(user.id);

            await interaction.reply(
                embedMessage({
                    body: `User ${user} has the following fields:\n${
                        Object.entries(userData)
                            .map(([key, data]) => `**\`${key}\`**: \`${data}\``)
                            .join("\n")
                    }`,
                    ...storageEmbedConfig
                })
            );
        } break;

        case "set": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key') as userField;
            if (!user || !key) return;

            let data: any = interaction.options.getString('data') ?? true;
            const original = getUserData(user.id);

            switch (data) {
                case "true": data = true; break;
                case "false": data = false; break;
                default: data = isNaN(data) ? data : +data;
            }

            const oldVal = getUserField(user.id, key);
            await setUserField(user.id, key, data);

            const body = oldVal !== undefined
                ? `Set field **\`${key}\`** for user ${user}:\n### from: \`${oldVal}\`\n### to: \`${data}\``
                : `Set field **\`${key}\`** for user ${user}:\n### \`${data}\``;

            await interaction.reply(
                embedMessage({ body, ...storageEmbedConfig })
            );
        } break;

        case "remove": {
            const user = interaction.options.getUser('user');
            const key = interaction.options.getString('key') as userField;
            if (!user || !key) return;

            const userData = getUserData(user.id);
            if (!(key in userData)) {
                await interaction.reply(
                    embedMessage({
                        body: `Key **\`${key}\`** was not found for user ${user}.`,
                        ...storageEmbedConfig,
                        color: colors.Error as HexColorString
                    })
                );
                return;
            }

            await removeUserField(user.id, key);

            await interaction.reply(
                embedMessage({
                    body: `Removed **\`${key}\`** field from user ${user}`,
                    ...storageEmbedConfig
                })
            );
        } break;
    }
}
