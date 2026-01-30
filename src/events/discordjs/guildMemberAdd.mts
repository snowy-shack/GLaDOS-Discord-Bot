import {Client, Events} from "discord.js";
import {userFields, getUserField, setUserField} from "#src/modules/localStorage.mts";

export function init(client: Client): void {
    client.on(Events.GuildMemberAdd, async (member) => {
        // Make sure the user isn't considered a ghost
        let wasGhost = getUserField(member.id, userFields.Ghost);
        if (wasGhost) await setUserField(member.id, userFields.Ghost, "false");
    });
}