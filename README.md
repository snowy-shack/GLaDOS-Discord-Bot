# GLaDOS discord.mts bot
Management and quality of life bot for **PortalMod** and **Phanty's Home**

# Install
```bash
npm install

npm run start # Uses prod.env
npm run debug # Uses beta.env
```

`Current Version: 3.04.0`

# Changelog
## Release 3.04.0 - November 5nd 2025
### Changes
- GLaDOS now sanitises messages to respond to, in an attempt to reduce prompt injection, prompt was tweaked.
- New /about command will now list information about GLaDOS.

## Release 3.03.0 - November 2nd 2025
### Changes
- GLaDOS now uses a different AI model, and gets 3 messages of context when responding to messages
- GLaDOS now also responds when pinged, including replies
- GLaDOS now retries 3 times when replying to messages if an error is hit, in the case of the AI model being temporarily unavailable.

## Release 3.02.0 - July 2nd 2025
### Changes
- GLaDOS now has a chance to answer intelligently.

## Release 3.01.0 - June 2nd 2025
### Changes
- GLaDOS now automatically detects spam links and times users out when one is sent. The message is then deleted and moderators are notified.
- `/kick` is now `/moderator` and includes new `lockup` and `unlock` subcommands for managing locked up users.
- Structural changes
- Logs are now colored for better readability.
- Added more details to certain log calls.

### Fixes
- Added a locking system to user data management to prevent race conditions.
- Birthday notification now has line breaks properly again.

## Release 3.00.2 - May 26th 2025
### Changes
- Moved birthday notifications to be localized.

## Release 3.00.1 - May 24th 2025
### Changes
- Now reacts 🎉 to welcome messages in exclusive chats
- Now logs /babble uses
- Now logs when adding a ♥️ reaction

## Release 3.00.0 - May 14th 2025
Major rewrite to TypeScript
### Changes
- Better error handling, now includes the error stack when logging
- Refactored events to not be in `index.mts`
- Overall stability improvement and fixes
- Users with 'silly' in their (user)name will now automatically get a designated role
- Automated module syncing

## Release 2.00.2 - April 14th 2025
### Fixes
- Corrected daily birthday detected

## Release 2.00.1 - April 4th 2025
### Changes
- Logs now use the 'body' field rather than the 'title' of an embed
- Errors in the logs now ping `@PhantomEye`
- More automatic responses
### Fixes
- Fetching members by role now first fetches the members rather than relying on a potentially outdated cache (#3)
- Checking whether a day is today now parses the string date correctly (#4)
- Template string replacement now checks if array values are undefined rather than being falsy


## Release 2.00.0 - March 18th 2025
Major rewrite of the bot's infrastructure, switching to ESM standards and overall improving stability,
readability, and performance.
### Changes
- Logs and generic interaction replies are now formatted in embeds
- Introduced new `/kick` command, which kicks and notifies the user kicked 
- Better support and error handling for commands, buttons and modals
- Merged `/refresh_faqs` and `/refresh_rules` into `/refresh <faq|rules>`
- Added `bsky.app` to the recognized art domains
- Introduced a new `styledEmbed` module for creating embeds in a generalized way
- GLaDOS can now automatically respond to messages randomly with humorous responses
- Overall refactors and name changes

#### FLAGS
Introduced a new flags system, which can locally keep track of variables per user
- Added 'ghost' tracking, when members are no longer in the server, so that GLaDOS can ignore them
- Replaced booster and birthday implementations to use flags rather than the database
- Keeps track of user's Minecraft UUID to skip the skin form the second time around
- New `/flags <set|get|remove>` admin command to change the value of flags

#### STRINGS
Introduced a new strings system, which keeps all long text responses in one place.
- Moved long strings to string files
- Allows for potential future multi-language support

#### CONSTS
Introduced new constant modules which provide easy access to values for emojis, icons, colors, channel and role IDs, etc.
- Moved emojis, channels and roles from `.env` files to `phantys_home.mts`

## Release 1.09.0 - January 31st 2025
### Changes
- Added general chat pings for when it's someone's birthday
### Fixes
- Checked user identity when clicking retry button

## Release 1.08.6 - January 28th 2025
### Fixes
- Final /birthday next tweaks

## Release 1.08.5 - January 28th 2025
### Fixes
- Fixed /birthday next SQL query

## Release 1.08.4 - January 28th 2025
### Changes
- Added /birthday next command

## Release 1.08.3 - January 27th 2025
### Fixes
- Fixed logging if input date format is incorrect

## Release 1.08.2 - January 27th 2025
### Fixes
- Fixed /birthday permissions
- Added /birthday add logging

## Release 1.08.1 - January 27th 2025
### Fixes
- Fixed an off-by-one error on birthdays

## Release 1.08.0 - January 27th 2025
### Changes
- Birthday command

## Release 1.07.0 - January 25th 2025
### Fixes
- Merged two instances of the bot's code.
- DB automatic reconnect

## Release 1.6.2 - October 30th 2024
### Fixes
- More error handling for skin form DMs
- Some import fixes

## Release 1.6.1 - October 30th 2024
### Fixes
- Hotfix: users weren't marked as MESSAGED when GLaDOS dm'ed them
- Rebooting wouldn't log because the service quit before the reboot could be logged

## Release 1.6 - October 29th 2024
### Changes
- Added functionality to handle skin form errors and give boosters another attempt
- Implemented button handling


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

## Release 1.3.1 - June 21st 2024
### Fixes
- Regular Expression that detected art links no longer stops at line breaks

## Release 1.3 - June 21st 2024
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
