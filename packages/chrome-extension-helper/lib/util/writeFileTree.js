const fs = require("fs-extra");
const path = require("path");

function deleteRemovedFiles(directory, newFiles, previousFiles) {
  // get all files that are not in the new filesystem and are still existing
  const filesToDelete = Object.keys(previousFiles).filter(
    filename => !newFiles[filename]
  );

  // delete each of these files
  return Promise.all(
    filesToDelete.map(filename => {
      return fs.unlink(path.join(directory, filename));
    })
  );
}

/**
 * 
 * @param {*} dir 目录
 * @param {*} files 多个文件
 * @param {*} previousFiles 
 * 
  // eg: write package.json
    await writeFileTree(context, {
      'package.json': JSON.stringify(pkg, null, 2)
    })
 */
module.exports = async function writeFileTree(dir, files, previousFiles) {
  if (process.env.CEH_CLI_SKIP_WRITE) {
    return;
  }
  if (previousFiles) {
    await deleteRemovedFiles(dir, files, previousFiles);
  }
  Object.keys(files).forEach(name => {
    const filePath = path.join(dir, name);
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, files[name]);
  });
};
