async function getUuid(username) {
  const fetch = require('node-fetch');
  
  const url = `https://api.ashcon.app/mojang/v2/user/${username}`;
  await fetch(url)
    .then(res => res.json())
    .then(json => {
      uuid = json.uuid;
      usernameNew = json.username;
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