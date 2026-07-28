import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    InteractionEditReplyOptions,
    SlashCommandBuilder
} from "discord.js";
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {formatMessage, logError} from "#src/core/logs.mts";
import { toError } from "#src/core/try-catch.mts";
import { embedMessage } from "#src/formatting/styledEmbed.mts";

export const name = 'apply_jumpsuit';

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
    const armWidthOption = interaction.options.getString('arm_width');

    try {
        const workerPath = fileURLToPath(new URL('../workers/jumpsuitWorker.mjs', import.meta.url));
        const child = fork(workerPath);

        const result = await new Promise<{ success: boolean, buffer?: string, armWidth?: string, error?: string }>((resolve) => {
            let settled = false;
            const settle = (value: typeof result) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };

            const timeout = setTimeout(() => {
                child.kill();
                settle({ success: false, error: 'Timed out' });
            }, 30_000);

            child.once('message', (msg: any) => {
                clearTimeout(timeout);
                settle(msg);
            });

            child.on('exit', (code) => {
                clearTimeout(timeout);
                settle({ success: false, error: `Worker crashed (exit code ${code})` });
            });

            child.send({ username, armWidth: armWidthOption });
        });

        if (!result.success) throw new Error(result.error);

        const buffer = Buffer.from(result.buffer!, 'base64');
        const armWidth = result.armWidth!;
        const fileName = `${username}_jumpsuit.png`;
        const attachment = new AttachmentBuilder(buffer, { name: fileName });

        await interaction.editReply({
            files: [attachment],
            ...embedMessage<InteractionEditReplyOptions>({ body:
                `## Generated your Test Subject skin!` +
                `\nOriginal skin: \`${username}\`. I assumed \`${armWidth} pixel\` arms.` +
                "\nYou can change your skin [here](https://www.minecraft.net/en-us/msaprofile/mygames/editskin) or using your favorite launcher.",
                thumbnail: `attachment://${fileName}`
            })
        });
    } catch (e: unknown) {
        await logError("Generating jumpsuit skin", toError(e));
        await interaction.editReply(
            formatMessage("Failed to fetch skin or apply jumpsuit. Ensure username is correct.")
        );
    }
}
