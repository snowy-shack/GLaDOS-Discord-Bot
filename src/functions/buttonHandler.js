export async function reply(interaction) {
  const { customId } = interaction;

  const [modulePath, buttonID] = customId.split('#');

  const module = await import(`../${modulePath.replace(/\./g, '/')}`);
  await module.buttonPressed(buttonID, interaction);
}

export default { reply };