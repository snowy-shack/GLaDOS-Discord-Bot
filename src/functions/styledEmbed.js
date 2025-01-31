const {
    EmbedBuilder,
} = require("discord.js");
const colors = require("../consts/colors");

const emojiIcons = {
    home:   'https://portalmod.net/images/icons/home.png',
    mark:   'https://portalmod.net/images/icons/mark.png',
    events: 'https://portalmod.net/images/icons/events.png',
}

function makeEmbed(bodyText, footerText, title, color = colors.Primary, fields = []) {
    isPortalModEmbed = title.includes("PortalMod");
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

module.exports = makeEmbed;