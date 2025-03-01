import { getClient } from "#src/modules/client";

export let phantys_home;
export let channels;
export let users;

/* private */ async function init() {
    const client = await getClient();

    phantys_home = await client.guilds.fetch(process.env.GUILDID);

    channels = await phantys_home.channels.fetch();
    users = await phantys_home.members.fetch();
}

await init();

export function getGuild() {
    return phantys_home;
}

export async function getMember(id) {
    const cachedUser = users.get(id);

    if (cachedUser) return cachedUser;

    try {
        return await phantys_home.members.fetch(id);
    } catch {
        return undefined;
    }
}

export async function getChannel(id) {
    const cachedChannel = channels.get(id);

    if (cachedChannel) return cachedChannel;

    try {
        return await phantys_home.channels.fetch(id);
    } catch {
        return undefined;
    }
}

export async function getRoleUsers(id) {
    const role = await phantys_home.roles.fetch(id);

    return await role.members.map(member => member.user.id);
}