async function getUuid(username) {
  const fetch = require('node-fetch');
  
  const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;
  await fetch(url)
    .then(res => res.json())
    .then(json => {
      uuid = `${json.id.slice(0, 8)}-${json.id.slice(8, 12)}-${json.id.slice(12, 16)}-${json.id.slice(16, 20)}-${json.id.slice(20)}`; // Formatting with dashes
      usernameNew = json.name;
      if (!uuid) return;
    });
  return([await uuid, await usernameNew]);
}

async function getSkin(uuid) {
  return `https://mc-heads.net/head/${uuid}/600.png`;
}

module.exports = {
  getUuid,
  getSkin
};