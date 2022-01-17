const fs = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');
const constants = require('./constants').constants;
const platforms = require('./constants').platforms;
const downloadManager = require('./downloadManager');
const protocolRegister = require('./protocolRegister');
const ProtocolRegistry = require("protocol-registry");

function checkFsExist(path){
  if (fs.existsSync(path))
    return true;
  else
    return false;
};

function checkSdburiAppExist(){
  return checkFsExist(join(constants.sdburiPath.dir, 'URL-sdburi.app') );
};

function checkSdbExist(){
  return checkFsExist(join(constants.sdburiPath.dir, constants.sdbPath.exec) );
};

function checkSdburiExist(){
  return checkFsExist(constants.sdburiPath.path);
};

function checkSdburiDirExist(){
  return checkFsExist(constants.sdburiPath.dir);
};

function createSdburiDir(){
  if (!checkSdburiDirExist())
    fs.mkdirSync(constants.sdburiPath.dir);
};

function checkExecPermission(execPath) {
  console.info(
    'tools.checkExecPermission: execPath = ' + execPath
  );
  try {
    fs.accessSync(execPath, fs.constants.S_IXUSR);
  } catch (err) {
    fs.chmodSync(
      execPath,
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
      const child = spawnSync(sdbExec, ['kill-server']);
    }
    fs.copyFileSync(sdbExec, join(constants.sdburiPath.dir, constants.sdbPath.exec));
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
  checkExecPermission(join(constants.sdburiPath.dir, constants.sdburiPath.exec));
  if (process.platform === platforms.macos){
    checkExecPermission(join(constants.sdburiPath.dir, 'script.sh'));
  }
  fs.rmdirSync(join(constants.sdburiPath.dir, 'tmp')); 
}

function checkSdbBinariesExist(){
  if (!checkSdburiExist())
    return false;
   
  if (!checkSdbExist())
    return false;

  if (process.platform === platforms.macos){    
    if (!checkSdburiAppExist())
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
    let isSdbBinariesExist = checkSdbBinariesExist();
    if (isSdbBinariesExist && isSdburiActivated)
    {
      return;
    }

    createSdburiDir();
    await Promise.all([copySdb(), downloadSdburi()]);
    await protocolRegister.protocolRegister();
  } catch(ex) {
    throw ex;
  }

};

module.exports = {
  installSdburi,
};
