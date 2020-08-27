["exit", "logger", "spinner", "env"].forEach(name => {
  Object.assign(exports, require(`./lib/${name}`));
});
exports.chalk = require("chalk");
exports.execa = require("execa");
