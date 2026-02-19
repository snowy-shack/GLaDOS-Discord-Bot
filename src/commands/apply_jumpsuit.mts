import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    InteractionEditReplyOptions,
    SlashCommandBuilder
} from "discord.js";
import { createCanvas, loadImage } from 'canvas';
import {formatMessage, logError} from "#src/core/logs.mts";
import path from "node:path";
import {embedMessage} from "#src/formatting/styledEmbed.mts";

export function init() {
    return new SlashCommandBuilder().setName('apply_jumpsuit')
        .setDescription('Adds a jumpsuit to your minecraft skin')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Java Edition username')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('arm_width')
                .setDescription('How wide your arms are (optional)')
                .addChoices(
                    {name: "3 Pixels", value: "3"},
                    {name: "4 Pixels", value: "4"}
                )
        );
}

export async function react(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const username = interaction.options.getString('username', true);
    let armWidth = interaction.options.getString('arm_width');

    try {
        const skin = await loadImage(`https://minotar.net/skin/${username}`);

        const canvas = createCanvas(64, 64);
        const ctx = canvas.getContext('2d');

        // Draw base skin
        ctx.drawImage(skin, 0, 0);

        if (armWidth === null) {
            // If this pixel is transparent, then the skin is likely 3px
            const pixelData = ctx.getImageData(50, 18, 51, 19).data;
            const isTransparent = pixelData[3] === 0;

            armWidth = isTransparent ? "3" : "4";
        }

        const jumpsuit = await loadImage(path.join(process.cwd(), "src/consts/images", `jumpsuit_${armWidth}px.png`));

        // Remove previous overlay
        ctx.clearRect(0, 32, 64, 16);
        ctx.clearRect(0, 48, 16, 16);
        ctx.clearRect(48, 48, 16, 16);

        // Otherwise, simply composite the jumpsuit over it
        ctx.drawImage(jumpsuit, 0, 0);

        const fileName = `${username}_jumpsuit.png`;
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: fileName });

        await interaction.editReply({ files: [ attachment ],
            ...embedMessage<InteractionEditReplyOptions>({ body:
                `## Generated your Test Subject skin!` +
                `\nOriginal skin: \`${username}\`. I assumed \`${armWidth} pixel\` arms.` +
                "\nYou can change your skin [here](https://www.minecraft.net/en-us/msaprofile/mygames/editskin) or using your favorite launcher.",

                thumbnail: `attachment://${fileName}`
            }) }
        );
    } catch (e: any) {
        await logError("Generating jumpsuit skin", e);
        await interaction.editReply(
            formatMessage("Failed to fetch skin or apply jumpsuit. Ensure username is correct.")
        );
    }
}