# GLaDOS bot for Phanty's Home
Management and quality of life bot for PortalMod and Phanty's Home  

`Current Version: 1.5.1`

# To-do
- Add more error logging with discord.js events
- Come up with more to-do features

# Known issues
- When running /reboot, the bot shuts down before being able to log that it's terminating itself
- Running /increment_boosters runs more than just incrementing boosters
- Reaction removing logs even if it couldn't remove anything

# Changelog
## Release 1.5.1 - July 26th 2024
### Fixes
- Fixed a wrong string type in the booster form, which caused "${fieldValue}" to be shown to the user
- Combined database queries to ensure boosters aren't DM'ed multiple times

## Release 1.5 - July 24th 2024
### Changes
- Added functionality to remove ♥️ reactions when the message author reacts :delete: to their message

## Release 1.4 - July 20th 2024
### Changes
- Moved emojis that the bot uses to Discord's new application emojis instead of server emojis
- Some minor refactors 

## Release 1.3.1 - June 21th 2024
### Fixes
- Regular Expression that detected art links no longer stops at line breaks

## Release 1.3 - June 21th 2024
### Changes
- Added detection of art links for auto reactions
- Auto-reactions got an upgrade

## Release 1.2.4 - May 8th 2024
### Changes
- Added log message for /reboot

## Release 1.2.3 - May 6th 2024
### Fixes
- Prevented some undefined object crashes

## Release 1.2.2 - May 6th 2024
### Fixes
- Fixed a module import
