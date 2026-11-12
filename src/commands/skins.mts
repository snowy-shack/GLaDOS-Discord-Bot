import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContainerBuilder,
    escapeMarkdown,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorBuilder,
    SlashCommandBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    User
} from "discord.js";
import * as logs from "#src/core/logs.mts";
import {logError} from "#src/core/logs.mts";
import {getAllSkins, getGunSkin, getGunSkins, Skin} from "#src/modules/portalGunSkinLoader.mts";
import {errorEmbedMessage} from "#src/formatting/styledEmbed.mts";
import {toError, tryCatch} from "#src/core/try-catch.mts";
import colors from "#src/consts/colors.mts";
import {getMinecraftPlayer, getPlayerSkins, MinecraftPlayer, PlayerSkins} from "#src/core/minecraft.mts";

export const name = 'skins';

const MC_USERNAME_MATCH = /^[A-Za-z0-9_]{3,16}$/;
const skinImage = (skinId: string) => `https://cdn.portalmod.net/renders/skins/${skinId}`;
const accentColor = parseInt(colors.Primary.slice(1), 16);

// A Components V2 message holds at most 40 components. The container, header and separator use 3,
// and each skin row uses 3 (section, text, thumbnail), so 12 rows fit with room for one overflow line.
const MAX_SKIN_ROWS = 12;

export async function init() {
    const skins = await getAllSkins();

    return new SlashCommandBuilder().setName("skins")
        .setDescription("Portal Gun skins")
        .addSubcommand(subCommand =>
            subCommand.setName("get")
                .setDescription("Show the Portal Gun skins a player has")
                .addStringOption(option =>
                    option.setName("username")
                        .setDescription("Minecraft username")
                        .setRequired(true)
                        .setMinLength(3)
                        .setMaxLength(16)
                )
        )
        .addSubcommand(subCommand =>
            subCommand.setName("info")
                .setDescription("Show information about a Portal Gun skin")
                .addStringOption(option =>
                    option.setName("skin")
                        .setDescription("The Portal Gun skin to look up")
                        .setRequired(true)
                        .addChoices(...skins) // Same list as /skin form
                )
        );
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    switch (interaction.options.getSubcommand()) {
        case "get": {
            const username = interaction.options.getString('username', true).trim();

            if (!MC_USERNAME_MATCH.test(username)) {
                await interaction.editReply(errorEmbedMessage("That isn't a valid Minecraft username."));
                return;
            }

            const { data, error } = await tryCatch((async () => {
                const player = await getMinecraftPlayer(username);
                return player && { player, playerSkins: await getPlayerSkins(player.uuid) };
            })());

            if (error) {
                await logs.logError(`fetching skins for Minecraft player ${username}`, toError(error));
                await interaction.editReply(errorEmbedMessage("Couldn't reach the PortalMod API. Please try again later."));
                return;
            }

            if (!data) {
                await interaction.editReply(errorEmbedMessage(`There's no Minecraft player called **${escapeMarkdown(username)}**.`));
                return;
            }

            await interaction.editReply({
                components: [await playerSkinsCard(data.player, data.playerSkins)],
                flags: MessageFlags.IsComponentsV2,
            });
        } break;

        case "info": {
            const skin_id = interaction.options.getString('skin', true);
            await interaction.editReply(await skinInfoMessage(skin_id, interaction.user));
        } break;
    }
}

async function playerSkinsCard(player: MinecraftPlayer, playerSkins: PlayerSkins) {
    const catalog = await getGunSkins();

    // Filter away duplicates
    const owned = new Set(playerSkins.skins);
    const catalogOrder = Object.keys(catalog);
    const skinIds = [
        ...catalogOrder.filter(id => owned.has(id)),
        ...[...owned].filter(id => !(id in catalog)),
    ];

    const count = skinIds.length;
    const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `## \`${escapeMarkdown(player.username)}\`'s Portal Gun skins\n` +
            `-# ${count === 0 ? "No skins unlocked yet" : `${count} skin${count === 1 ? "" : "s"} unlocked`}`
        ));

    if (count === 0) return container;

    container.addSeparatorComponents(new SeparatorBuilder());

    for (const id of skinIds.slice(0, MAX_SKIN_ROWS)) {
        const skin = catalog[id];

        const lines = [];
        lines.push(`## **${skin?.name ?? id}**` + (skin?.artist ? ` - by ${skin.artist}` : ""));

        lines.push(skin.description ?? "-# *No Description*");

        container.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")))
            .setThumbnailAccessory(new ThumbnailBuilder()
                .setURL(skinImage(id))
                .setDescription(skin?.name ?? id)
            )
        );
    }

    const overflow = skinIds.slice(MAX_SKIN_ROWS);
    if (overflow.length > 0) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `-# Also: ${overflow.map(id => catalog[id]?.name ?? id).join(", ")}`
        ));
    }

    return container;
}


// ---- /skins info ----

const INFO_BUTTON_PREFIX = "commands.skins#info";

function toTimestamp(date: string): string {
    const seconds = Math.floor(new Date(date).getTime() / 1000);
    return Number.isNaN(seconds) ? date : `<t:${seconds}:D>`;
}

/** ◀ / ▶ buttons on a `/skins info` card. Button ID format: `info:<prev|next>:<skin_id>`. */
export async function buttonPressed(buttonID: string, interaction: ButtonInteraction) {
    const [action, , skin_id] = buttonID.split(":");
    if (action !== "info" || !skin_id) return;

    // Only the person who ran the command can flip through the skins.
    const owner = interaction.message.interactionMetadata?.user.id;
    if (owner && owner !== interaction.user.id) {
        await interaction.reply({
            ...errorEmbedMessage("These buttons belong to someone else. Use `/skins info` to browse yourself."),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.deferUpdate();
    await interaction.editReply({ ...await skinInfoMessage(skin_id, interaction.user) });
}

async function skinInfoMessage(skin_id: string, user: User) {
    const skin: Skin | undefined = await getGunSkin(skin_id);

    if (skin === undefined) {
        await logError("fetching gun skin for /skins reply", Error("getGunSkin() returned undefined"));
        return {};
    }

    const unlocks: string = skin.skin_id === "default" ? "ꝏ" : `${skin.unlocks}`;

    let texture = skinImage(skin.skin_id);

    const header = new TextDisplayBuilder().setContent(
        `# ${escapeMarkdown(skin.name)} Skin` + ` (\`${skin.skin_id}\`)` + (skin.artist ? `\n## By ${escapeMarkdown(skin.artist)}` : "") + "\n"
        + ` \`${unlocks}⭐️\` · ${escapeMarkdown(skin.description)}\n`
    );

    const container = new ContainerBuilder().setAccentColor(accentColor);

    container
        .addTextDisplayComponents(header)
        .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(texture).setDescription(skin.name)
        ));

    container
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Added:** ${toTimestamp(skin.created_at)}`),
            new TextDisplayBuilder().setContent(`**Obtain:** ${skin.hint ?? "Unknown"}`),
        );

    container.addSeparatorComponents(new SeparatorBuilder());
    for (const row of await infoButtons(skin.skin_id)) container.addActionRowComponents(row);

    return {components: [container], flags: MessageFlags.IsComponentsV2 as const};
}

async function infoButtons(skin_id: string) {
    // The same order as the API, which is also the order of the choices
    const order = (await getAllSkins()).map(skin => skin.value);
    const index = order.indexOf(skin_id);
    const prev = order[(index - 1 + order.length) % order.length];
    const next = order[(index + 1) % order.length];

    const links = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Info")
            .setURL("https://portalmod.net/info/skins"),
    );

    if (index === -1) return [links];

    const browse = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("◀️")
            .setCustomId(`${INFO_BUTTON_PREFIX}:prev:${prev}`),
        new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${index + 1} / ${order.length}`)
            .setCustomId(`${INFO_BUTTON_PREFIX}:page:${skin_id}`)
            .setDisabled(true),
        new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("▶️")
            .setCustomId(`${INFO_BUTTON_PREFIX}:next:${next}`),
    );

    return [browse, links];
}
