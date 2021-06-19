var fs = require("fs");

const GREEN_FG = '\x1b[32m';
const RED_FG = '\x1b[31m';
const YELLOW_FG = '\x1b[33m';
const UNDERSCORE = '\x1b[4m';
const BRIGHT = '\x1b[1m';
const RESET = '\x1b[0m';

module.exports.check = () => {
    const foundNodeVersion = process.versions.node;
    console.log(`Current node version -> ${RED_FG}${foundNodeVersion}${RESET}`);
}