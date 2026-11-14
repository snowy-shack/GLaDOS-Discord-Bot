// Primary Entry Point commands launch an Activity; Discord forbids them from having options/subcommands,
// so this can't live under /wordle alongside the "stats" subcommand - it has to be its own top-level command.
// Must be registered globally (guilds can't own an entry point command) and discord.js's SlashCommandBuilder
// doesn't model this command shape, so it's sent as a raw REST payload instead of a builder.
export const wordleEntryPointCommand = {
    name: "play-wordle",
    description: "Launch GLaDOS Wordle",
    type: 4, // PRIMARY_ENTRY_POINT
    handler: 2, // DISCORD_LAUNCH_ACTIVITY - Discord launches the activity and posts the follow-up itself
    contexts: [0, 1, 2],
    integration_types: [0, 1],
};
