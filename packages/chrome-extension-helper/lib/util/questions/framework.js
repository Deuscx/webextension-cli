module.exports = cli => {
  cli.injectFeature({
    name: "Framework",
    value: "framework",
    short: "FRAMEWORK",
    description: "Add Vue  as Framework for the popup page | options page",
    plugins: ["framework"]
  });

  cli.injectPrompt({
    name: "useFramework",
    when: answers => answers.features.includes("framework"),
    type: "list",
    message:
      "Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)?",
    description: "It will add to popup or options page.",
    choices: [
      {
        name: "vue",
        value: "vue"
      },
      {
        name: "cancel",
        value: false
      }
    ]
  });

  cli.onPromptComplete((answers, options) => {
    options.useFramework = answers.useFramework || false;
  });
};
