async function react(interaction) {
  await interaction.reply(`> \`🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms\``);
}

module.exports = { react };