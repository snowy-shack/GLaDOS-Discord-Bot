import { getClient } from "#src/modules/client";
import {guildID} from "#src/consts/phantys_home";
import {flags, setFlag} from "#src/agents/flagAgent";

let phantys_home;

/* private */ async function init() {
    const client = await getClient();

    phantys_home = await client.guilds.fetch(guildID);

    await phantys_home.channels.fetch();
    await phantys_home.members.fetch();
}

await init();

export function getGuild() {
    return phantys_home;
}

export async function getMember(id) {
    const cachedUser = phantys_home.members.cache.get(id);

    if (cachedUser) return cachedUser;

    try {
        return await phantys_home.members.fetch(id);
    } catch {
        setFlag(id, flags.Ghost);
        return undefined;
    }
}

export async function getChannel(id) {
    const cachedChannel = phantys_home.channels.cache.get(id);

    if (cachedChannel) return cachedChannel;

    try {
        return await phantys_home.channels.fetch(id);
    } catch {
        return undefined;
    }
}

export async function getRoleUsers(id) {
    await phantys_home.members.fetch(); // Ensure all members are cached (#3)
    const role = await phantys_home.roles.fetch(id);

    return await role.members.map(member => member.user.id);
}