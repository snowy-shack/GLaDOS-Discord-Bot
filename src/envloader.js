const dotenv = require("dotenv");
const path = require("path");
const args = process.argv.slice(2);

const isBeta = args.includes("--beta") || args.includes("-b");
const envFile = isBeta ? ".envbeta" : ".env";

dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });
console.log(`Using environment file: ${envFile}`);