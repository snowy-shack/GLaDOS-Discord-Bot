import {Client, Events} from "discord.js";
import {channels, roles} from "#src/consts/phantys_home.mjs";
import {spamKick} from "#src/actions/spamKick.mjs";
import * as logs from "#src/modules/logs.mjs";
import {getChannel} from "#src/modules/discord.mjs";
import {embed} from "#src/factories/styledEmbed.mjs";
import {string} from "#src/agents/stringAgent.mjs";

export function init(client: Client): void {
    client.on(Events.GuildMemberUpdate, async (oldMember, member) => {
        if (member.roles.cache.has(roles.SpamBot)) {
            await spamKick(member, "User selected Spam Bot role");
        }

        try {
            const sillyRole = roles.Silly;
            const username = member.nickname ?? member.displayName;

            // Add the role if their username contains 'silly'
            if (username.toUpperCase().indexOf("SILLY") !== -1 && !member.roles.cache.has(roles.Silly)) {
                await member.roles.add(sillyRole);
                await logs.logMessage(`😝 Added Silly role to <@${member.user.id}>`);

                // Remove the role if their username doesn't
            } else if (username.toUpperCase().indexOf("SILLY") === -1 && member.roles.cache.has(roles.Silly)) {
                await member.roles.remove(sillyRole);
                await logs.logMessage(`😝 Removed Silly role from <@${member.user.id}>`);
            }

        } catch (error: any) {
            await logs.logError("Managing Silly role", error);
        }

        try {
            const supporterRole = roles.Donator;
            const boosterRole   = roles.Booster;

            // Check if the member didn't have a supporter role, but does now
            if ((member.roles.cache.has(supporterRole) || member.roles.cache.has(boosterRole))
                && !oldMember.roles.cache.has(supporterRole) && !oldMember.roles.cache.has(boosterRole)) {

                const channel = await getChannel(channels.Exclusive);
                if (!channel || !channel.isTextBased()) return false;

                void logs.logMessage(`🙋‍♂️ Welcoming <@${member.user.id}> to ${channel}.`);

                const welcome_message = embed(
                    await string("server.message.exclusive.welcome"),
                    "messages.welcome",
                    "Phanty's Home exclusive chat"
                );

                channel.send({ embeds: [welcome_message], content: `<@${member.user.id}>` });
            }
        } catch (error: any) {
            await logs.logError("Welcoming user", error);
        }
    });
}