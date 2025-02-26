import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import * as logs from "#src/modules/logs";


export function init() {
  return new SlashCommandBuilder().setName("reboot")
    .setDescription("Reboots GLaDOS")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction) {
  await interaction.reply(logs.formatMessage("💀 Shutting down"));
  await logs.logMessage("💀 Attempting to restart");
  console.log("💀 Shutting down after command request");
  process.exit();
}

export default { react, init };