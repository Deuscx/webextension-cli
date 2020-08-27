module.exports = cli => {
  cli.injectFeature({
    name: "CSS Pre-processors",
    value: "css-preprocessor",
    description: "Add support for CSS pre-processors like Sass, Less or Stylus",
    link: "https://cli.vuejs.org/guide/css.html"
  });

  const notice = "PostCSS and CSS Modules are supported by default";

  cli.injectPrompt({
    name: "cssPreprocessor",
    when: answers => answers.features.includes("css-preprocessor"),
    type: "list",
    description: `${notice}.`,
    choices: [
      {
        name: "Sass/SCSS (with node-sass)",
        value: "node-sass"
      },
      {
        name: "Less",
        value: "less"
      }
    ]
  });

  cli.onPromptComplete((answers, options) => {
    if (answers.cssPreprocessor) {
      options.cssPreprocessor = answers.cssPreprocessor;
    }
  });
};
