import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import boosterHandler from "#src/functions/boosterHandler";
import * as logs from "#src/modules/logs";


export function init() {
  return new SlashCommandBuilder().setName("increment_boosters")
    .setDescription("Increments boosting days of all boosters in the DB")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function react(interaction) {
  await interaction.reply(logs.formatMessage("➕ Incrementing boosters"));
  console.log("Manually incrementing boosters");
  await boosterHandler.incrementAndDM();
}