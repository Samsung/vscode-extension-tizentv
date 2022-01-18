const fs = require('fs');
const { join } = require('path');
const constants = require('./constants').constants;
const platforms = require('./constants').platforms;
const downloadManager = require('./downloadManager');
const protocolRegister = require('./protocolRegister');
const ProtocolRegistry = require("protocol-registry");
const sdburiUtils = require("./utils.js");

async function checkFsExist(path){
  return await sdburiUtils.isPathExists(path);
};

async function checkSdburiAppExist(){
  return await checkFsExist(join(constants.sdburiPath.dir, 'URL-sdburi.app') );
};

async function checkSdbExist(){
  return await checkFsExist(join(constants.sdburiPath.dir, constants.sdbPath.exec) );
};

async function checkSdburiExist(){
  return await checkFsExist(constants.sdburiPath.path);
};

async function checkSdburiDirExist(){
  return await checkFsExist(constants.sdburiPath.dir);
};

async function createSdburiDir(){
  if (!(await checkSdburiDirExist())){
    if (!(await sdburiUtils.makeDir(constants.sdburiPath.dir)))
      return false;
  }
  return true;
};

async function checkExecPermission(execPath) {
  console.info(
    'tools.checkExecPermission: execPath = ' + execPath
  );

  if (!(await sdburiUtils.access(execPath, fs.constants.S_IXUSR))){
    await sdburiUtils.changeMode(execPath,
      fs.constants.S_IRWXU |
        fs.constants.S_IRWXG |
        fs.constants.S_IROTH |
        fs.constants.S_IXOTH
      );
  }
}

async function copySdb(){
    let sdbExec = await constants.sdbPath.path;
    if ((process.platform === platforms.windows) && checkSdbExist())
    {
      await sdburiUtils.exec(`${sdbExec} kill-server`);
    }
    await sdburiUtils.copyFile(sdbExec, join(constants.sdburiPath.dir, constants.sdbPath.exec));
};

async function downloadSdburi(){
  try {
    var pkgInfo = await downloadManager.getPackageInfo(
     constants.sdburiDownloadUrl,
      'tv-samsung-sdburi',
    );
  } catch (ex) {
    throw 'Get package info exception!';
  }
  await downloadManager.downloadPkg(pkgInfo);
  await downloadManager.unzipPkgDir(
    join(constants.sdburiPath.dir, 'tmp'),
    join(constants.sdburiPath.dir), 
    constants.sdburiPath.filterDir,
    constants.sdburiPath.filterExec,
  );
  await checkExecPermission(join(constants.sdburiPath.dir, constants.sdburiPath.exec));
  if (process.platform === platforms.macos){
    await checkExecPermission(join(constants.sdburiPath.dir, 'script.sh'));
  }
  await sdburiUtils.removeDir(join(constants.sdburiPath.dir, 'tmp'));
}

async function checkSdbBinariesExist(){
  if (!(await checkSdburiExist()))
    return false;
   
  if (!(await checkSdbExist()))
    return false;

  if (process.platform === platforms.macos){    
    if (!(await checkSdburiAppExist()))
      return false;   
  }

  return true;
}

const isProtocolRegistered = async (protocol) =>{
  return await ProtocolRegistry.checkifExists(protocol)
  .then((res) => {
    return res;
  })
  .catch((ex) => {
    throw ex;
  });  
};

async function installSdburi(){
  try {
    const isSdburiActivated = await isProtocolRegistered(constants.sdburiPath.name);
    let isSdbBinariesExist = await checkSdbBinariesExist();
    if (isSdbBinariesExist && isSdburiActivated)
      return;
    if (!(await createSdburiDir()))
      return;

    await Promise.all([copySdb(), downloadSdburi()]);
    await protocolRegister.protocolRegister();
  } catch(ex) {
    throw ex;
  }

};

module.exports = {
  installSdburi,
};
