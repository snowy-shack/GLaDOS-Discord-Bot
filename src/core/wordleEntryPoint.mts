// Primary Entry Point commands launch an Activity from the App Launcher (not the "/" picker - see
// /wordle play for that). Must be registered globally (guilds can't own an entry point command) and
// discord.js's SlashCommandBuilder doesn't model this command shape, so it's a raw REST payload.
// Discord title-cases this name for display in the App Launcher, so keep it a single word - a
// hyphenated name like "play-wordle" renders oddly as "Play-wordle".
export const wordleEntryPointCommand = {
    name: "wordle",
    description: "Launch GLaDOS Wordle",
    type: 4, // PRIMARY_ENTRY_POINT
    handler: 2, // DISCORD_LAUNCH_ACTIVITY - Discord launches the activity and posts the follow-up itself
    contexts: [0, 1, 2],
    integration_types: [0, 1],
};
