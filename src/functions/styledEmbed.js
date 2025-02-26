import { EmbedBuilder } from "discord.js";
import colors from "#src/consts/colors";

/* private */ const emojiIcons = { // TODO generalize to consts/icons.js
    home:   'https://portalmod.net/images/icons/home.png',
    mark:   'https://portalmod.net/images/icons/mark.png',
    events: 'https://portalmod.net/images/icons/events.png',
}

export function makeEmbed(bodyText, footerText, title, color = colors.Primary, fields = []) {
    const isPortalModEmbed = title.includes("PortalMod");
    const formTitle = { 
        name: title, 
        iconURL: isPortalModEmbed ? 'https://portalmod.net/images/logo/mark.png' : emojiIcons.home
    };

    return new EmbedBuilder().setColor(color)
        .setAuthor(formTitle)
        .setDescription(bodyText)
        .setFooter({text: footerText})
        .addFields(...fields)
        .setTimestamp();
}