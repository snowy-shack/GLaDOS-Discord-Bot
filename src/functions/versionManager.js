const fs = require('fs').promises;
const path = require('path');

async function getVersion() {
    const data = await fs.readFile(path.join(__dirname, '../../README.md'), 'utf8');
    const version = data.match(/Current Version:\s*([\d]+\.[\d]+\.[\d]+)/);
    return version ? version[1] : '.unknown';
}

module.exports = { getVersion }