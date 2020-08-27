const path = require("path");
const validateProjectName = require("validate-npm-package-name");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const clear = require("clear");
const { chalk, exit } = require("chrome-extension-cli-utils");
const Creator = require("./Creator");
async function init(projectName, options) {
  const cwd = options.cwd || process.cwd(); // 当前目录
  const inCurrent = projectName === "."; // 是否在当前目录
  const name = inCurrent ? path.relative("../", cwd) : projectName; // 项目名称
  const targetDir = path.resolve(cwd, projectName || "."); //生成项目的目录
  console.log(name, options, targetDir);
  //验证项目名是否有效
  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`));
    result.errors &&
      result.errors.forEach(err => {
        console.error(chalk.red.dim("Error: " + err));
      });
    result.warnings &&
      result.warnings.forEach(warn => {
        console.error(chalk.red.dim("Warning: " + warn));
      });
    exit(1);
  }

  if (fs.existsSync(targetDir)) {
    if (options.force) {
      //如果是强制，移除目标路径
      await fs.remove(targetDir);
    } else {
      clear();
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: "ok",
            type: "confirm",
            message: `Generate project in current directory?`
          }
        ]);
        if (!ok) {
          return;
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: "action",
            type: "list",
            message: `Target directory ${chalk.cyan(
              targetDir
            )} already exists. Pick an action:`,
            choices: [
              { name: "Overwrite", value: "overwrite" },
              { name: "Cancel", value: false }
            ]
          }
        ]);
        if (!action) {
          return;
        } else if (action === "overwrite") {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
          await fs.remove(targetDir);
        }
      }
    }
  }

  //TODO:
  const creator = new Creator(name, targetDir);
  creator.answerQuestions(options);
}

module.exports = function (...args) {
  return init(...args);
};
