exports.questionsPrompts = [
  "typescript",
  "eslint",
  "framework",
  "cssPreProcessor"
].map(file => require(`./${file}`));
