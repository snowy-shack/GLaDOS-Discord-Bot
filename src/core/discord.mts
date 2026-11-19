import { getClient } from "#src/core/client.mts";
import {userFields, setUserField} from "#src/modules/localStorage.mts";
import {Client, Guild, GuildMember} from "discord.js";
import {guildID} from "#src/core/phantys_home.mts";
import chalk from "chalk";

let phantys_home: Guild;

async function init(client: Client) {
    console.log(chalk.gray("Initializing discord server..."));

    phantys_home = await client.guilds.fetch(guildID);

    await phantys_home.channels.fetch();
    await phantys_home.members.fetch();
    console.log(chalk.gray("Discord data initialized."));
}

export function getGuild() {
    return phantys_home;
}

export async function getMember(id: string) {
    const cachedUser = phantys_home.members.cache.get(id);

    if (cachedUser) return cachedUser;

    try {
        return await phantys_home.members.fetch(id);
    } catch {
        void setUserField(id, userFields.Ghost);
        return undefined;
    }
}

export async function getChannel(id: string) {
    const cachedChannel = phantys_home.channels.cache.get(id);

    if (cachedChannel) return cachedChannel;

    try {
        return await phantys_home.channels.fetch(id);
    } catch {
        return undefined;
    }
}

export async function getRoleUsers(id: string): Promise<GuildMember[] | null> {
    const role = await phantys_home.roles.fetch(id);
    if (!role) return null;

    // REST paging instead of the gateway member-chunk fetch (#3) - the latter has been seen to
    // silently hang for a full 2 minutes before timing out, REST has been reliable in comparison
    let after: string | undefined;
    for (;;) {
        const page = await phantys_home.members.list({limit: 1000, after});
        if (page.size === 0) break;

        after = page.lastKey();
        if (page.size < 1000) break;
    }

    return role.members.map(member => member);
}

export default { init, name: () => "discord" }