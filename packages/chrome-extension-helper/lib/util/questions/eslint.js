module.exports = cli => {
  cli.injectFeature({
    name: "Eslint+prettier",
    value: "lint",
    short: "ESLINT+PRETTIER",
    description: "Add Eslint and prettier to format your project",
    plugins: ["ESLINT+PRETTIER"]
  });

  cli.injectPrompt({
    name: "useHuskyAndStaged",
    when: answers => answers.features.includes("lint"),
    type: "confirm",
    message: "Use Husky and Staged for your git commit and more?",
    description: "It will  prevent  `git commit`, `git push`. and lint staged",
    default: false
  });

  cli.onPromptComplete((answers, options) => {
    options.useHuskyAndStaged = answers.useHuskyAndStaged || false;
  });
};
