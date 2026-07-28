import { createCanvas, loadImage } from 'canvas';
import path from 'node:path';

process.on('message', async ({ username, armWidth: inputArmWidth }) => {
    try {
        let canvas = createCanvas(64, 64);
        let ctx = canvas.getContext('2d');

        let skin = await loadImage(`https://minotar.net/skin/${username}`);
        ctx.drawImage(skin, 0, 0);
        skin = null;

        let armWidth = inputArmWidth;
        if (armWidth === null) {
            const pixelData = ctx.getImageData(50, 18, 1, 1).data;
            armWidth = pixelData[3] === 0 ? "3" : "4";
        }

        let jumpsuit = await loadImage(path.join(process.cwd(), "src/consts/images", `jumpsuit_${armWidth}px.png`));
        ctx.clearRect(0, 32, 16, 14); // Leg 1
        ctx.clearRect(0, 48, 16, 14); // Leg 2
        ctx.clearRect(16, 32, 24, 16); // Body
        ctx.clearRect(40, 32, 16, 13); // Arm 1
        ctx.clearRect(48, 48, 16, 13); // Arm 2
        ctx.clearRect(0, 0, 8, 8);    // Logo
        ctx.drawImage(jumpsuit, 0, 0);
        jumpsuit = null;

        const buffer = canvas.toBuffer();
        ctx = null;
        canvas = null;

        process.send({ success: true, buffer: buffer.toString('base64'), armWidth });
    } catch (e) {
        process.send({ success: false, error: e?.message ?? 'Unknown error' });
    }

    process.exit(0);
});
