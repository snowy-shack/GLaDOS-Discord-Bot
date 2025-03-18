import {ChannelType, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {embedMessageObject} from "#src/factories/styledEmbed";

export function init() {
    return new SlashCommandBuilder().setName("ticket")
        .setDescription("Manage Tickets")
        .addSubcommand(subcommand => subcommand
            .setName("create")
            .setDescription("Create a Ticket")
            .addStringOption(option => option
                .setName("topic")
                .setDescription("Reason for the Ticket")
                .setRequired(true)
            )
        )

        .addSubcommand(subcommand => subcommand
            .setName("rename")
            .setDescription("Rename this Ticket")
            .addStringOption(option => option
                .setName("topic")
                .setDescription("Updated topic for the Ticket")
                .setRequired(true)
            )
        )

        .addSubcommand(subcommand => subcommand
            .setName("close")
            .setDescription("Close this Ticket")
        )

        .addSubcommand(subcommand => subcommand
            .setName("bump")
            .setDescription("Bump this Ticket")
        )

        .addSubcommand(subcommand => subcommand
            .setName("lock")
            .setDescription("Lock this Ticket")

        )
        // .setContexts(InteractionContextType.Guild)
}

export async function react(interaction) {
    const channel = interaction.channel;

    switch (interaction.options.getSubcommand()) {
        // ticket create
        case "create": {
            const topic = interaction.options.getString("topic");

            const ticket = await channel.threads.create({
                name: "🎫 " + topic,
                joinable: false,
                // invitable: false,
                // manageable: false,
                // locked: true,
                // viewable: false,
                // sendable: false,
                type: ChannelType.PrivateThread,
            });

            await ticket.send(embedMessageObject(
                "Hey new guy! Welcome to this ticket",
                "ticket",
                "Phanty's Home Tickets"
            ));

            ticket.members.add(interaction.user.id);
        } break;

        // ticket close
        case "close": {
            if (!channel.isThread()) {
                interaction.reply("No can do!");
            }

            if (/* interaction.user.id !== thread.ownerId
                    && */ !interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
                // interaction.reply("You can't do that!");
            }

            interaction.reply("C ya!");

            await channel.setLocked(true);
            await channel.setArchived(true);
        } break;
    }
}