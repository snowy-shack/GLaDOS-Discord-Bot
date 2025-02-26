import * as dotenv from "dotenv";
import * as path from "path";

// Redefine __dirname
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);

const isBeta = args.includes("--beta") || args.includes("-b");
const envFile = isBeta ? "beta.env" : "prod.env";

// Apply the environment file
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });
console.log(`Using environment file: ${envFile}`);