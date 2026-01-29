import {Client, Events} from "discord.js";
import {flags, getFlag, setFlag} from "#src/modules/localStorage.mts";

export function init(client: Client): void {
    client.on(Events.GuildMemberAdd, async (member) => {
        // Make sure the user isn't considered a ghost
        let wasGhost = await getFlag(member.id, flags.Ghost);
        if (wasGhost) await setFlag(member.id, flags.Ghost, "false");
    });
}