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

export async function getUser(id) {
    const cachedUser = users.get(id);

    if (cachedUser) return cachedUser;

    const fetchedUser = await phantys_home.members.fetch(id);
    users.put(id, fetchedUser);

    return fetchedUser;
}

export async function getChannel(id) {
    const cachedChannel = channels.get(id);

    if (cachedChannel) return cachedChannel;

    const fetchedChannel = await phantys_home.channels.fetch(id);
    users.put(id, fetchedChannel);

    return fetchedChannel;
}