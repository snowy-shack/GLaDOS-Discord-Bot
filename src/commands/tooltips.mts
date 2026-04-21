import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";

export const name = 'tooltips';

export function init() {
    return new SlashCommandBuilder().setName('tooltips')
        .setDescription('Tell people to please consult the tooltips');
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.reply("https://cdn.discordapp.com/attachments/876477593245868114/1496260041773285386/image.png?ex=69e93c41&is=69e7eac1&hm=b58c9cc501d9bd2cebac9ca19c2cb126389fa442b8cfb5e6e31d241861b74046&");
}