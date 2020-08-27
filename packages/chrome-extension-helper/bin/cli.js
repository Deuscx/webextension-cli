const {chalk} = require('chrome-extension-cli-utils')


const fs = require('fs')
const path = require('path')


const program = require('commander')
program.version(require('../package.json').version) 

program
  .command('init <name>') //定义命令行 <name> 表示定义一个name变量
  .description('init a chrome extension project') //命令行说明
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .action((name,cmd)=>{
    //命令行执行操作函数 ，参数为定义的变量

    const options = cleanArgs(cmd)
    require('../lib/init')(name,options)

  }) 
  

program.parse(process.argv)


//转换为驼峰格式
function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}