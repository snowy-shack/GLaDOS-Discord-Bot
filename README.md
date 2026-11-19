# GLaDOS discord.mts bot
Management and quality of life bot for **PortalMod** and **Snowy Shack**

# Install
```bash
npm install

npm run start # Uses prod.env
npm run debug # Uses beta.env
```

# Changelog

## Release 3.12.4 - November 19th 2026
### Fixes
- The daily Wordle reminder's "Yesterday's results" list now comes from the Wordle server, the same records the results image is drawn from. Players who had already played today before the reminder went out were missing from it, and the day boundary now matches the Wordle day (UTC)
- If the Wordle server can't be reached, the reminder says the results couldn't be loaded instead of "Nobody played yesterday"

## Release 3.12.3 - November 19th 2026
### Changes
- The Wordle reminder role and pending list are now synced on boot, instead of only at midnight UTC. Subscribers who already played today are skipped and lose a leftover reminder role
### Fixes
- After a restart, the 10 PM streak warning and the reminder role no longer forget who still has to play that day

## Release 3.12.2 - November 19th 2026
### Changes
- Messages from the official Wordle app are now deleted automatically, since GLaDOS has its own Wordle system
- Each player gets at most one Wordle play status message per day: `/wordle play` only posts "is playing" the first time that day, and finishing edits it into "was playing" once. Games closed without finishing now block new "is playing" posts until the next Wordle day (midnight UTC), replacing the 3.12.0 behavior
### Fixes
- Running `/wordle play` twice in quick succession no longer posts two "is playing" messages

## Release 3.12.1 - November 19th 2026
### Changes
- `/wordle reminder on` now shows the reminder time as a Discord timestamp, so everyone sees 10 AM Amsterdam time in their own timezone and format

## Release 3.12.0 - November 19th 2026
### Changes
- New `/wordle reminder on|off`: subscribers get the Wordle reminder role and a daily 10 AM ping with yesterday's results image and a Play button, plus a 10 PM warning when their streak is at risk. Solving the day's Wordle removes the role until the next day
- `/wordle play` now posts a "is playing" message in Arcade, which is edited into "was playing" with a rendered image of the final board once the game ends (replaces the emoji-grid solve announcement)
- Wordle images show the player's server avatar, falling back to their global avatar, even before they've played that day
- "View stats" button next to every Wordle "Play!" button
- Skin codes are now a shared system: alongside `argskin` codes, the new `fruitskin` codes (ISBN-10) unlock the Fruit Portal Gun skin
- `/moderator storage` accepts any field key instead of a fixed list
### Fixes
- Mentions inside embeds in the Wordle solve announcement didn't actually ping
- The reminder role and pending list now reset at midnight UTC, the same moment the Wordle day flips, instead of midnight Amsterdam time
- Games closed without finishing no longer block future "is playing" posts for that player

## Release 3.11.1 - November 18th 2026
### Changes
- New `/wordle play` to launch the Wordle Activity from the slash command picker
- The Activity's App Launcher entry is now called "Wordle"

## Release 3.11.0 - November 14th 2026
### Changes
- New Wordle system: GLaDOS connects to the Wordle Activity server (wordle.portalmod.net) to track per-player solves, streaks and a server-wide streak, replacing the old Wordle bot message parsing

## Release 3.10.1 - November 14th 2026
### Fixes
- Portal Gun skin form now adds the skin when `confirm` is sent with any capitalization or surrounding spaces (previously only exact lowercase worked, while still claiming success)
- Skin is only marked as unlocked locally after the API has stored it

## Release 3.10.0 - November 12th 2026
### Changes
- New `/skins get` command to show the Portal Gun skins a player has

## Release 3.09.1-exp - July 28th 2026
### Changes
- Added `/utils ip` subcommand to ephemerally display local and public IP addresses

## Release 3.09.0-exp - July 28th 2026
### Experimental
- Canvas (jumpsuit command) now runs in a sandboxed child process — a native crash no longer takes down the bot
- Crash logs are now sent to the webhook on uncaught exceptions, unhandled rejections, and unexpected process exits
- Added `npm run monitor` to run the bot with crash monitoring enabled

## Release 3.08.4 - July 28th 2026
### Changes
- Audio file attachments (ogg, mp4, m4a, etc.) in the art channel now receive a heart reaction, excluding Discord voice recordings

## Release 3.08.3 - July 28th 2026
### Changes
- Spam allowlist is now persistent across restarts
- Moderator spam notification now includes action buttons: Greenlight link, Unlock user, Spam-kick user
### Fixes
- Fixed circular dependency between spam detector and user lockup modules

## Release 3.08.2 - July 28th 2026
### Changes
- Moderator spam notification now shows the exact flagged link

## Release 3.08.1 - July 28th 2026
### Changes
- Rebrand
- Improved GLaDOS prompt to reduce character breaks and produce more varied responses
- Spam-kicked users now have their messages deleted
### Fixes
- Fixed retry button in skin form

## Release 3.08.0 - May 11th 2026
### Changes
- Now uses a smarter model and system to respond to messages

## Release 3.06.0 - January 30th 2026
### Fixes
- Fixed /birthday add command not working
### Changes
- Major rework of storage system back-end
- New `/wordle` command to see your stats, which are read from the Wordle app's messages

## Release 3.05.1 - December 4th 2025
### Changes
- Fixed embeds sending in DMs

## Release 3.05.0 - November 5th 2025
### Changes
- Tweaked formatting of `/about` command response embed.
- Massive codebase clean-up, specifically regarding creation of embeds.

## Release 3.04.0 - November 5th 2025
### Changes
- GLaDOS now sanitises messages to respond to, in an attempt to reduce prompt injection, prompt was tweaked.
- New `/about` command will now list information about GLaDOS.

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
