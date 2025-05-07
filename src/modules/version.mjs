import { promises as fs } from "fs";
import path from "path";

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function getVersion() {
    const data = await fs.readFile(path.join(__dirname, "../../README.md"), "utf8");
    const version = data.match(/Current Version:\s*([\d]+\.[\d]+\.[\d]+)/);

    return version ? version[1] : ".unknown";
}