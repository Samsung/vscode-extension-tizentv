const fs = require('fs').promises;
const fsPromises = require('fs').promises;
const execPromises = require('util').promisify(require('child_process').exec);

async function isPathExists(path){
    try {
        await fsPromises.access(path);
        return true;
    } catch (e) {
        return false;
    }
}

async function access(path, mode = fs.F_OK){
    return await fsPromises.access(path, mode)
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false;
        });
}

async function makeDir(path){
    return await fsPromises.mkdir(path)
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false;
        });
}

async function changeMode(path, mode){
    return await fsPromises.chmod(path, mode)
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false;
        });
}

async function copyFile(src, dst){
    return await fsPromises.copyFile(src, dst)
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false;
        });
}

async function removeDir(path){
    return await fsPromises.rmdir(path)
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false;
        });
}

async function readDir(path, mode = {
    encoding: 'utf8',
    withFileTypes: false
  }){
    return await fsPromises.readdir(path, mode)
        .then((dirArray) => {
            return dirArray;
        })
        .catch((err) => {
            return undefined;
        });
}

async function unlink(path){
    return await fsPromises.unlink(path)
        .then(() => {
            return true;
        })
        .catch((err) => {
            return false;
        });
}

async function exec(cmd){
    return await execPromises(cmd)
        .then(({ stdout, stderr }) => {
            return { stdout, stderr };
        })
        .catch((err) => {
            return undefined;
        });
};

module.exports = {
    isPathExists,
    access,
    makeDir,
    changeMode,
    copyFile,
    removeDir,
    readDir,
    unlink,
    exec
};
