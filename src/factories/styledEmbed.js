import { EmbedBuilder } from "discord.js";
import colors from "#src/consts/colors";

/* private */ const emojiIcons = { // TODO generalize to consts/icons.js
    home:   'https://portalmod.net/images/icons/home.png',
    mark:   'https://portalmod.net/images/icons/mark.png',
    events: 'https://portalmod.net/images/icons/events.png',
}
/**
 * Generates a styled Embed.
 * @param body Body text of the Embed.
 * @param footer Footer text of the Embed, excluding the timestamp.
 * @param title The title of the Embed.
 * @param color The color of the Embed, <code>colors.Primary</code> by default.
 * @param fields Column fields of the Embed.
 * @param thumbnail Image URL.
 * @returns An Embed object
 */
export function embed(body, footer, title, color = colors.Primary, thumbnail = "", fields = []) {
    const isPortalModEmbed = title.includes("PortalMod");
    const formTitle = { 
        name: title, 
        iconURL: isPortalModEmbed ? 'https://portalmod.net/images/logo/mark.png' : emojiIcons.home
    };

    return new EmbedBuilder().setColor(color)
        .setAuthor(formTitle)
        .setDescription(body)
        .setFooter({text: footer})
        .addFields(...fields)
        .setThumbnail(thumbnail)
        .setTimestamp();
}
/**
 * Generates a message with a styled Embed.
 * @param body Body text of the Embed.
 * @param footer Footer text of the Embed, excluding the timestamp.
 * @param title The title of the Embed.
 * @param color The color of the Embed, <code>colors.Primary</code> by default.
 * @param hidden Whether the Embed should only be visible to this user.
 * @param fields Column fields of the Embed.
 * @param thumbnail Image URL.
 * @returns A message object that can directly be used with <code>.send</code> and <code>.reply</code>.
 */
export function message(body, footer, title, color = colors.Primary, hidden, thumbnail = "", fields = []) {
    return { embeds: [ embed(body, footer, title, color, thumbnail, fields) ], ephemeral: hidden };
}