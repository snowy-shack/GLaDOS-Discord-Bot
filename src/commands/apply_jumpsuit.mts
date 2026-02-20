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

    let canvas: any = createCanvas(64, 64);
    let ctx: any = canvas.getContext('2d');

    try {
        let skin: any = await loadImage(`https://minotar.net/skin/${username}`);
        ctx.drawImage(skin, 0, 0);
        skin = null; // Release C++ memory

        if (armWidth === null) {
            const pixelData = ctx.getImageData(50, 18, 1, 1).data;
            armWidth = pixelData[3] === 0 ? "3" : "4";
        }

        let jumpsuit: any = await loadImage(path.join(process.cwd(), "src/consts/images", `jumpsuit_${armWidth}px.png`));
        ctx.clearRect(0, 32, 16, 14); // Leg 1
        ctx.clearRect(0, 48, 16, 14); // Leg 2

        ctx.clearRect(16, 32, 24, 16); // Body

        ctx.clearRect(40, 32, 16, 13); // Arm 1
        ctx.clearRect(48, 48, 16, 13); // Arm 2

        ctx.clearRect(0, 0, 8, 8); // Logo

        ctx.drawImage(jumpsuit, 0, 0);
        jumpsuit = null; // Release C++ memory

        const fileName = `${username}_jumpsuit.png`;
        const buffer = canvas.toBuffer();
        const attachment = new AttachmentBuilder(buffer, { name: fileName });

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
    } finally {
        // Force memory clean-up
        ctx = null;
        canvas = null;
    }
}