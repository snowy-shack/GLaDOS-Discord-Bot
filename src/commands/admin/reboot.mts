import {SlashCommandBuilder, PermissionFlagsBits, CommandInteraction} from "discord.js";
import * as logs from "#src/core/logs.mts";
import chalk from "chalk";
import {webhook} from "#src/core/logs.mts";

export const name = 'reboot';

export function init() {
  return new SlashCommandBuilder().setName("reboot")
    .setDescription("Reboots GLaDOS")
}

export async function react(interaction: CommandInteraction) {
  await interaction.reply(logs.formatMessage("💀 Shutting down"));
  await reboot();
}

export async function reboot() {
  await webhook.logMessage("GLaDOS shut down.");
  console.log(chalk.red("💀 Shutting down after command request"));
  process.exit();
}