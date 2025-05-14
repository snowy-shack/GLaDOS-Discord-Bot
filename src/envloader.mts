import * as dotenv from "dotenv";
import * as path from "path";

// Redefine __dirname
import { fileURLToPath } from "url";
const __dirname: string = path.dirname(fileURLToPath(import.meta.url));

const args: string[] = process.argv.slice(2);

export const isBeta: boolean = args.includes("--beta") || args.includes("-b");

// Apply the environment file
const envFile: `${string}.env` = isBeta ? "beta.env" : "prod.env";

dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });
console.log(`Using environment file: ${envFile}`);