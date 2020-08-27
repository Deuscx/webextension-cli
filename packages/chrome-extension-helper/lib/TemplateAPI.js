const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const writeFileTree = require("./util/writeFileTree");
const { stopSpinner, logWithSpinner } = require("chrome-extension-cli-utils");
class TemplateAPI {
  constructor(templatePath, distPath, preset, projectName) {
    this.cwd = templatePath;
    this.dist = distPath || process.cwd();
    this.options = preset;
    this.projectName = projectName;
  }

  resolveByPresets() {
    let { features, pages } = this.options;

    let tempArr = this.readAllPath();
    let hasFeature = f => features.includes(f);
    let basePages = ["popup", "options", "background", "content"];

    //resolve delete files
    let toDeleteFiles = basePages.filter(v => !pages.includes(v));
    if (!hasFeature("ts")) {
      toDeleteFiles.push("tsconfig.json");

      // push .ts rpath to js

      tempArr.forEach(({ name, rPath }, index) => {
        if (name.includes(".ts")) {
          let newFile = {
            name: name,
            rPath: rPath,
            nExt: "js"
          };

          tempArr.splice(index, 1, newFile);
        }
      });
    }
    !hasFeature("lint") && toDeleteFiles.push(".eslint", ".prettierrc");

    //FIXME:
    !hasFeature("framework") && toDeleteFiles.push(".vue");

    // resolve need write files
    tempArr = tempArr.filter(({ rPath }) => {
      let shouldDelete = toDeleteFiles.some(v => {
        return rPath.includes(v);
      });
      return !shouldDelete;
    });
    // add options
    this.options.projectName = this.projectName;

    let files = {};

    tempArr.forEach(({ rPath, nExt }) => {
      if (nExt) {
        files[rPath.replace(".ts", ".js")] = this.render(rPath, this.options);
      } else {
        files[rPath] = this.render(rPath, this.options);
      }
    });

    return files;
  }
  /**
   *
   * @param {*} basePath
   * @returns eg: [  { name: '.eslintrc.js.ejs', rPath: '.eslintrc.js.ejs' },]
   */
  readAllPath(basePath = this.cwd) {
    const direntArr = fs.readdirSync(basePath, { withFileTypes: true });
    let templatePathArr = [];
    direntArr.forEach(d => {
      if (d.isFile())
        templatePathArr.push({
          name: d.name,
          rPath: path.relative(this.cwd, path.resolve(basePath, d.name))
        });
      if (d.isDirectory()) {
        templatePathArr = templatePathArr.concat(
          this.readAllPath(path.resolve(basePath, d.name))
        );
      }
    });
    return templatePathArr;
  }

  async writeAll(distPath = this.dist) {
    // resolve files
    let files = this.resolveByPresets();
    logWithSpinner("✍ writing files...");
    await writeFileTree(distPath, files);
    stopSpinner();
  }

  render(templateFilePath, data) {
    const template = fs.readFileSync(
      path.join(this.cwd, templateFilePath),
      "utf-8"
    );

    return ejs.render(template, data);
  }
}

module.exports = TemplateAPI;
