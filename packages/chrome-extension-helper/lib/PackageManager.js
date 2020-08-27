const {
  hasProjectYarn,
  hasProjectNpm,
  execa,
  logWithSpinner,
  stopSpinner
} = require("chrome-extension-cli-utils");

const PACKAGE_MANAGER_CONFIG = {
  npm: {
    install: ["install", "--loglevel", "error"],
    add: ["install", "--loglevel", "error"],
    upgrade: ["update", "--loglevel", "error"],
    remove: ["uninstall", "--loglevel", "error"]
  },
  yarn: {
    install: [],
    add: ["add"],
    upgrade: ["upgrade"],
    remove: ["remove"]
  }
};
class PackageManager {
  constructor({ context, forcePackageManager } = {}) {
    this.context = context || process.cwd();

    if (forcePackageManager) {
      this.bin = forcePackageManager;
    } else if (context) {
      if (hasProjectYarn(context)) {
        this.bin = "yarn";
      } else if (hasProjectNpm(context)) {
        this.bin = "npm";
      } else {
        this.bin = "npm";
      }
    }
  }

  async runCommand(command, args) {
    logWithSpinner(`⌛ ${this.bin}  ${command} is running`);
    try {
      await execa(
        this.bin,
        [...PACKAGE_MANAGER_CONFIG[this.bin][command], ...(args || [])],
        { cwd: this.context }
      );
      stopSpinner(`${this.bin}  ${command} succeed`);
    } catch (error) {
      stopSpinner(`error in ${command}`);
    }
  }

  async install() {
    return await this.runCommand("install");
  }

  async add(packageName, { tilde = false, dev = true } = {}) {
    const args = dev ? ["-D"] : [];
    if (tilde) {
      if (this.bin === "yarn") {
        args.push("--tilde");
      } else {
        process.env.npm_config_save_prefix = "~";
      }
    }

    return await this.runCommand("add", [packageName, ...args]);
  }

  async remove(packageName) {
    return await this.runCommand("remove", [packageName]);
  }
}

module.exports = PackageManager;
