/* 
创建步骤:


*/
const inquirer = require("inquirer");
const cloneDeep = require("lodash.clonedeep");
const merge = require("lodash.merge");
const path = require("path");
const fs = require("fs-extra");
const Preset = require("./util/Preset");
const PromptModuleAPI = require("./PromptModuleAPI");
const TemplateAPI = require("./TemplateAPI");
const PackageManager = require("./PackageManager");
const { getRcPath } = require("./util/config.js");
const writeFileTree = require("./util/writeFileTree");

const {
  error,
  log,
  done,

  exit,
  clearConsole,
  chalk
} = require("chrome-extension-cli-utils");
const { questionsPrompts } = require("./util/questions");

const rcPath = getRcPath("ceh");
const isManualMode = answers => answers.preset === "__manual__";
class Creator {
  constructor(name, cwd) {
    this.name = name;
    this.cwd = cwd;
    this.injectedPrompts = [];
    this.promptCompleteCbs = [];
    this.resolveIntroQuestions();

    const promptAPI = new PromptModuleAPI(this);

    questionsPrompts.forEach(m => m(promptAPI));
  }

  resolveIntroQuestions() {
    this.featurePrompt = {
      name: "features",
      when: isManualMode,
      type: "checkbox",
      message: "Check the features needed for your project:",
      choices: [],
      pageSize: 10
    };
  }

  /**
   * 创建的主流程
   * @param {*} cliOptions cli选项
   * @param {*} preset
   */
  async answerQuestions(cliOptions, preset = null) {
    if (cliOptions.preset) {
      // init test --preset recommended
      preset = await this.resolvePreset(cliOptions.preset);
    } else {
      preset = await this.promptAndResolvePreset();
    }
    // clone before mutating  复制预设

    preset = cloneDeep(preset);

    if (preset.features === undefined) {
      error("please choose a feature");
      exit(1);
    }
    const {
      features,
      useFramework,
      useHuskyAndStaged,
      cssPreprocessor
    } = preset;
    /* 
    TODO:
      resolve package.json
      extension: 
      [manifest.json, content.js,background.js,eslintrc.js,.babelrc,]      
    */
    const hasOneFeature = f => features.includes(f);

    const basePackageJson = {
      name: this.name,
      version: "1.0.0",
      description: "",
      scripts: {
        build: " cross-env NODE_ENV=production webpack ",
        "build:dev": " cross-env NODE_ENV=development webpack ",
        "build-zip": "node scripts/build-zip.js"
      },
      keywords: [],
      author: "",
      license: "ISC",
      devDependencies: {
        "@babel/core": "^7.2.2",
        "@babel/preset-env": "^7.3.1",
        "babel-loader": "^8.0.5",
        "copy-webpack-plugin": "^6.0.3",
        "cross-env": "^7.0.2",

        "file-loader": "^6.0.0",
        "html-webpack-plugin": "^4.3.0",
        "mini-css-extract-plugin": "^0.10.0",
        cssnano: "^4.1.10",
        "postcss-loader": "^3.0.0",
        "postcss-preset-env": "^6.7.0",
        "css-loader": "^4.2.2",
        webpack: "^4.44.1",
        "webpack-cli": "^3.3.12",
        "webpack-dev-server": "^3.1.14",
        "webpack-merge": "^5.1.2"
      }
    };
    //Ts feature
    hasOneFeature("ts") &&
      merge(basePackageJson, {
        devDependencies: {
          "@types/chrome": "0.0.122",
          typescript: "4.0.2",
          "ts-loader": "^8.0.3"
        }
      });
    //lint feature
    if (hasOneFeature("lint")) {
      merge(basePackageJson, {
        scripts: {
          eslint: "eslint --color --ext .ts,.vue --fix src/**/*",
          prettier: "prettier  --write src/**/{*.ts,*.tsx,*.vue}"
        },
        devDependencies: {
          "eslint-plugin-import": "^2.22.0",
          eslint: "^7.7.0",
          prettier: "^2.1.1"
        }
      });

      // use husky lint-staged
      if (useHuskyAndStaged) {
        merge(basePackageJson, {
          husky: {
            hooks: {
              "pre-commit": "lint-staged",
              "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
            }
          },
          "lint-staged": {
            "*.{js,less,md,json}": ["prettier --write"],
            "*.ts?(x)": ["prettier  --write", "eslint --fix --color"]
          },
          devDependencies: {
            husky: "^4.2.5",
            "lint-staged": "^10.2.13",
            prettier: "^2.1.1",
            eslint: "^7.7.0"
          }
        });
      }

      hasOneFeature("ts") &&
        merge(basePackageJson, {
          devDependencies: {
            "@typescript-eslint/eslint-plugin": "^3.10.1",
            "@typescript-eslint/parser": "^3.10.1"
          }
        });
    }

    //css professor
    if (hasOneFeature("css-preprocessor")) {
      let config = {
        "node-sass": {
          devDependencies: {
            "node-sass": "^4.14.1",
            "sass-loader": "^10.0.1"
          }
        },
        less: {
          devDependencies: {
            "less-loader": "^7.0.0"
          }
        }
      };

      merge(basePackageJson, config[cssPreprocessor]);
    }
    //framework feature
    if (hasOneFeature("framework")) {
      if (useFramework === "vue") {
        merge(basePackageJson, {
          dependencies: {
            vue: "^2.6.12"
          },
          devDependencies: {
            "vue-loader": "^15.9.3",
            "vue-template-compiler": "^2.6.12"
          }
        });
        hasOneFeature("lint") &&
          merge(basePackageJson, {
            devDependencies: {
              "eslint-plugin-vue": "^6.2.2"
            }
          });
      }
    }

    await fs.ensureDir(this.cwd);
    //Write package.json
    await writeFileTree(this.cwd, {
      "package.json": JSON.stringify(basePackageJson, null, 2)
    });

    const pm = new PackageManager({ context: this.cwd });
    //download dependencies
    await pm.install();

    done("install success");
    //generate File  [manifest.json, content.js,background.js,eslintrc.js,.babelrc,]
    let tp = new TemplateAPI(
      path.resolve(__dirname, "./templates/basic"),
      this.cwd,
      preset,
      this.name
    );
    await tp.writeAll();

    done("✅ success");
  }
  async promptAndResolvePreset(answers = null) {
    if (!answers) {
      await clearConsole();
      answers = await inquirer.prompt(this.resolveFinalQuestions());
    }

    let preset;
    if (answers.preset && answers.preset !== "__manual__") {
      preset = await this.resolvePreset(answers.preset);
    } else {
      // manual
      preset = {
        plugins: {}
      };
      answers.features = answers.features || [];
      preset.features = answers.features;
      preset.pages = answers.pages || [];
      preset.addon = answers.addon || [];

      // run cb registered by prompt modules to finalize the preset
      this.promptCompleteCbs.forEach(cb => cb(answers, preset));
    }

    // validate

    // save preset
    if (
      answers.save &&
      answers.saveName &&
      Preset.savePreset(answers.saveName, preset)
    ) {
      log();
      log(
        `🎉  Preset ${chalk.yellow(answers.saveName)} saved in ${chalk.yellow(
          rcPath
        )}`
      );
    }

    return preset;
  }
  resolvePreset(presetName) {
    const savedPresets = Preset.loadOptions().presets;
    let preset;
    if (presetName in savedPresets) {
      preset = savedPresets[presetName];
    }
    if (!preset) {
      error(`preset "${presetName}" not found.`);
      const presets = Object.keys(savedPresets);
      if (presets.length) {
        log();
        log(`available presets:\n${presets.join(`\n`)}`);
      } else {
        log(`you don't seem to have any saved preset.`);
        log(`run vue-cli in manual mode to create a preset.`);
      }
      exit(1);
    }
    return preset;
  }
  resolveAddonQuestions() {
    const AddonQuestions = [
      {
        //添加对应功能
        name: "pages",
        when: isManualMode,
        type: "checkbox",
        message: "please choose the page you want to create",
        choices: [
          {
            name: "popup"
          },
          {
            name: "background",
            checked: true
          },
          {
            name: "options"
          },
          { name: "content" }
        ]
      },
      {
        //添加对应功能
        name: "addon",
        when: isManualMode,
        type: "checkbox",
        message: "please choose which addon you want to add",
        choices: [{ name: "storage" }]
      }
    ];

    return AddonQuestions;
  }
  resolveBackQuestions() {
    const outroPrompts = [
      {
        //是否保存自定义的配置
        name: "save",
        when: isManualMode,
        type: "confirm",
        message: "Save this as a preset for future projects?",
        default: false
      },
      {
        //将保存
        name: "saveName",
        when: answers => answers.save,
        type: "input",
        message: "Save preset as:"
      }
    ];

    return outroPrompts;
  }

  resolveFinalQuestions() {
    let presetPrompt = Preset.createPresetPrompts();
    // 将所有的 Prompt 合并，包含 preset，feature，injected，outro，只有当选择了手动模式的时候才会显示 injectedPrompts
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true);
      prompt.when = answers => {
        return isManualMode(answers) && originalWhen(answers);
      };
    });
    let allPrompt = [
      presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.resolveAddonQuestions(),
      ...this.resolveBackQuestions()
    ];

    return allPrompt;
  }
}

module.exports = Creator;
