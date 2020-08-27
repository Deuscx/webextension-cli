const { getRcPath } = require("./config.js");
const cloneDeep = require("lodash.clonedeep");
const { error, exit } = require("chrome-extension-cli-utils");

const fs = require("fs");
exports.defaultPreset = {
  features: ["ts"],
  plugins: { ts: { useTsWithBabel: true } },
  pages: ["popup", "background"],
  addon: ["storage"]
};
exports.defaults = {
  presets: {
    recommended: exports.defaultPreset
  }
};
const rcPath = getRcPath("ceh");
let cachedOptions;
class Preset {
  constructor() {}

  //TODO:
  loadOptions() {
    if (cachedOptions) {
      return cachedOptions;
    }
    if (fs.existsSync(rcPath)) {
      try {
        // 从配置文件中查找
        cachedOptions = JSON.parse(fs.readFileSync(rcPath, "utf-8"));
      } catch (e) {
        error(
          `Error loading saved preferences: ` +
            `~/ceh may be corrupted or have syntax errors. ` +
            `Please fix/delete it and re-run ceh in manual mode.\n` +
            `(${e.message})`
        );
        exit(1);
      }
      return cachedOptions;
    } else {
      try {
        fs.writeFileSync(rcPath, JSON.stringify(exports.defaults, null, 2));
        return exports.defaults;
      } catch (e) {
        error(
          `Error saving preferences: ` +
            `make sure you have write access to ${rcPath}.\n` +
            `(${e.message})`
        );
      }
    }
  }
  savePreset(name, preset) {
    const presets = cloneDeep(this.loadOptions().presets || {});
    presets[name] = preset;
    return this.saveOptions({ presets });
  }
  saveOptions(toSave) {
    const options = Object.assign(cloneDeep(this.loadOptions()), toSave);
    for (const key in options) {
      if (!(key in exports.defaults)) {
        delete options[key];
      }
    }
    cachedOptions = options;
    try {
      fs.writeFileSync(rcPath, JSON.stringify(options, null, 2));
      return true;
    } catch (e) {
      error(
        `Error saving preferences: ` +
          `make sure you have write access to ${rcPath}.\n` +
          `(${e.message})`
      );
    }
  }

  createPresetPrompts() {
    const presetChoices = Object.entries(this.loadOptions().presets).map(
      ([name, preset]) => {
        let displayName = name;
        if (name === "default") {
          displayName = "Default";
        }
        return {
          name: `${displayName} (${preset.features.join(" ")})`,
          value: name
        };
      }
    );
    return {
      type: "list",
      name: "preset",
      message: "choose Preset or get custom preset?",
      choices: [
        ...presetChoices,
        {
          name: "select yourself",
          value: "__manual__"
        }
      ]
    };
  }
}
let unitPreset = new Preset();
module.exports = unitPreset;
