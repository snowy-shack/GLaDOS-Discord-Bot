import {
    APIEmbedField,
    ColorResolvable,
    EmbedBuilder,
    MessageFlags,
} from "discord.js";
import colors from "#src/consts/colors.mts";
import {icons} from "#src/consts/icons.mts";


/**
 * Generates a styled Discord Embed.
 *
 * @param opts Object containing embed options.
 * @param opts.body Body text of the embed.
 * @param opts.footer Footer text (adds timestamp if provided).
 * @param opts.title Title text of the embed.
 * @param opts.color Embed color (`colors.Primary` by default).
 * @param opts.thumbnail Thumbnail image URL.
 * @param opts.fields Array of embed fields.
 * @param opts.icon Icon URL for the embed author section.
 *
 * @returns An `EmbedBuilder` instance.
 */
export function templateEmbed(opts: {
    body?: string;
    footer?: string;
    title?: string;
    color?: ColorResolvable;
    thumbnail?: string | null;
    fields?: APIEmbedField[];
    icon?: string;
}) {
    const {
        body = "",
        footer = "",
        title = "",
        color = colors.Primary,
        thumbnail = null,
        fields = [],
        icon
    } = opts;

    const isPortalModEmbed = title.includes("PortalMod");
    const author = {
        name: title,
        iconURL: icon ?? (isPortalModEmbed ? icons.portalmod : icons.home)
    };

    const embed = new EmbedBuilder().setColor(color);

    if (title  !== "") embed.setAuthor(author);
    if (body   !== "") embed.setDescription(body);
    if (footer !== "") {
        embed.setFooter({ text: footer });
        embed.setTimestamp();
    }

    if (thumbnail) embed.setThumbnail(thumbnail);
    if (fields.length > 0) embed.addFields(...fields);

    return embed;
}


/**
 * Generates a message object containing a styled Embed.
 *
 * @param opts Object containing embed options.
 * @param opts.body Body text of the embed.
 * @param opts.footer Footer text of the embed (timestamp added automatically if provided).
 * @param opts.title Title of the embed.
 * @param opts.color Embed color (`colors.Primary` by default).
 * @param opts.ephemeral Whether the message should only be visible to the user (`false` by default).
 * @param opts.fields Array of embed fields.
 * @param opts.thumbnail Thumbnail image URL.
 * @param opts.icon Icon URL for the embed author section.
 *
 * @returns A message object that can be used directly with `.send` or `.reply`.
 */
export function embedMessage<T>(opts: {
    body?: string;
    footer?: string;
    title?: string;
    color?: ColorResolvable;
    ephemeral?: boolean;
    thumbnail?: string | null;
    fields?: APIEmbedField[];
    icon?: string;
}): T {
    const {
        body = "",
        footer = "",
        title = "",
        color = colors.Primary,
        ephemeral = false,
        thumbnail = null,
        fields = [],
        icon
    } = opts;

    return {
        embeds: [templateEmbed({ body, footer, title, color, thumbnail, fields, icon })],
        ...(ephemeral && { flags: MessageFlags.Ephemeral })
    } as T;
}