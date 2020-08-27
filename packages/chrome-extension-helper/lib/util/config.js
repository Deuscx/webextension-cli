const os = require("os");
const path = require("path");

exports.getRcPath = file => path.join(os.homedir(), file);
