import {SlashCommandBuilder, PermissionFlagsBits, CommandInteraction} from "discord.js";
import * as logs from "#src/core/logs.mts";
import chalk from "chalk";

export function init() {
  return new SlashCommandBuilder().setName("reboot")
    .setDescription("Reboots GLaDOS")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction: CommandInteraction) {
  await interaction.reply(logs.formatMessage("💀 Shutting down"));
  await logs.logMessage("💀 Attempting to restart");
  console.log(chalk.red("💀 Shutting down after command request"));
  process.exit();
}