module.exports = class PromptModuleAPI {
  constructor (creator) {
    this.creator = creator
  }
  //添加选项
  injectFeature (feature) {
    this.creator.featurePrompt.choices.push(feature)
  }
  //添加问题
  injectPrompt (prompt) {
    this.creator.injectedPrompts.push(prompt)
  }
  //为对应的问题添加选项
  injectOptionForPrompt (name, option) {
    this.creator.injectedPrompts.find(f => {
      return f.name === name
    }).choices.push(option)
  }
  //添加问题完成回调
  onPromptComplete (cb) {
    this.creator.promptCompleteCbs.push(cb)
  }
}
