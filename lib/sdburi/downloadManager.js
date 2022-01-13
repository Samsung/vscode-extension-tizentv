// downloadManager is reffered from @tizentv/tools

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const got = require('got');
const hpagent = require('hpagent');
const stream = require('stream');
const { promisify } = require('util');
const decompress = require('decompress');
const npmConf = require('npm-conf')();
const xml2js = require('xml2js');
const constants = require('./constants');

const platform =
  process.platform == 'win32'
    ? `windows`
    : process.platform == 'linux'
    ? `ubuntu`
    : 'macos';
const pipeline = promisify(stream.pipeline);
const extensionRoot = path.resolve(__dirname, '..');
const toolsDir = path.resolve(extensionRoot, 'tools');
const platformToolDir = constants.sdburiPath.dir;
const tmpDir = path.resolve(platformToolDir, 'tmp');
const moduleName = '[vscode-extension-tizentv/sdburi]';

class PackageInfo {
  constructor(url) {
    this._archived = undefined;
    this.rootURL = url;
    this.details = {
      version: '',
      path: '',
      sha256: '',
      size: ''
    };
    this.unknownItems = Object.keys(this.details).length;
    console.log(this.details);
  }

  get archived() {
    return this._archived;
  }
  set archived(isArchived) {
    this._archived = isArchived;
  }
  get path() {
    return this.details.path;
  }
  get version() {
    return this.details.version;
  }
  get sha256() {
    return this.details.sha256;
  }
  get size() {
    return this.details.size;
  }

  collectPkgInfo(info) {
    let entry = info.split(':');
    let prop = entry[0].toLocaleLowerCase().trim();
    let propValue = entry[1].trim();
    if (this.details.hasOwnProperty(prop)) {
      if (this.details[prop] == '' && propValue != '') {
        this.details[prop] = propValue;
        this.unknownItems--;
      }
    }

    if (this.unknownItems == 0) {
      this._archived = true;
    }
  }
}

function getPackageInfo(rootURL, packageName, options) {
  console.info(moduleName + 'downloadManager.getPackageInfo(): start...');
  const bit = process.arch == 'x64' ? '64' : '32';
  const platform =
    process.platform == 'win32'
      ? `windows-${bit}`
      : process.platform == 'linux'
      ? `ubuntu-${bit}`
      : 'macos-64';
  let pkgList = rootURL + `/pkg_list_${platform}`;

  return new Promise(async (resolve, reject) => {
    console.info(
      moduleName + 'downloadManager.getPackageInfo(): request to: ' + pkgList
    );
    let userAgent = getUserAgent(pkgList, options);
    try {
      let pkglistStream = await got.stream(pkgList, userAgent);
      let pkgInfo = new PackageInfo(rootURL);
      let rl = readline.createInterface({ input: pkglistStream });
      rl.on('line', line => {
        if (pkgInfo.archived) {
          rl.close();
        }
  
        const searchPackage = `Package : ${packageName}`;
        if (line === searchPackage) {
          console.info(
            moduleName +
              'downloadManager.getPackageInfo(): got package info: ' +
              line
          );
          pkgInfo.archived = false;
        }
  
        if (pkgInfo.archived === false) {
          pkgInfo.collectPkgInfo(line);
        }
      });
  
      rl.on('close', () => {
        resolve(pkgInfo);
      });      
    } catch (error) {
      console.error(
        moduleName + 'downloadManager.getPackageInfo: got.stream(): ' + error
      );
      reject('got.stream failed!');
    }
  });
}

function getUserAgent(url, options) {
  console.info(moduleName + 'downloadManager.getUserAgent(): url = ' + url);
  const pathArr = url.split('/');
  const httpPrefix = pathArr[0];
  let userAgent;
  let userProxy = getProxy(options);

  if (httpPrefix == 'https:') {
    if (userProxy != undefined && userProxy != '') {
      console.info(
        moduleName +
          'downloadManager.getUserAgent():https userProxy = ' +
          userProxy
      );
      userAgent = {
        agent: {
          https: new hpagent.HttpsProxyAgent({ proxy: userProxy })
        }
      };
    }
  } else {
    if (userProxy != undefined && userProxy != '') {
      console.info(
        moduleName +
          'downloadManager.getUserAgent():http userProxy = ' +
          userProxy
      );
      userAgent = {
        agent: {
          http: new hpagent.HttpProxyAgent({ proxy: userProxy })
        }
      };
    }
  }

  return userAgent;
}

function getProxy(options) {
  if (options != undefined && options.proxy != undefined) {
    return options.proxy;
  }

  let proxy = npmConf.get('http-proxy');
  if (proxy == undefined || proxy == null || proxy == '') {
    proxy = npmConf.get('proxy');
  }
  if (proxy == undefined || proxy == null || proxy == '') {
    proxy = npmConf.get('https-proxy');
  }
  return proxy;
}

async function downloadPkg(packageInfo, options) {
  console.info(moduleName + 'downloadManager.downloadPkg(): start...');
  await downloadPkgFormPath(packageInfo.rootURL + packageInfo.path, options);
}

async function downloadPkgFormPath(packagePath, options) {
  console.info(moduleName + 'downloadManager.downloadPkgFormPath(): start...');
  if (packagePath == undefined || packagePath == '') {
    console.error(
      moduleName +
        'downloadManager.downloadPkgFormPath(): packagePath is invaild!'
    );
    return;
  }
  makeFilePath(tmpDir);

  const pathArr = packagePath.split('/');
  const pkgName = pathArr[pathArr.length - 1];
  let userAgent = getUserAgent(packagePath, options);
  try {
    console.log(
      '[webide-common-tizentv]Downloading from ' +
        packagePath +
        ' to ' +
        tmpDir +
        path.sep +
        pkgName
    );
    await pipeline(
      got.stream(packagePath, userAgent),
      fs.createWriteStream(tmpDir + path.sep + pkgName)
    );
  } catch (error) {
    console.error('[webide-common-tizentv]got.stream(): ' + error);
  }
}

async function unzipPkgDir(zipFileDir, unzipDir, filterDir, filterExec) {
  console.info(
    moduleName + 'downloadManager.unzipPkgDir(): unzipPkgDir start...'
  );
  if (!fs.existsSync(zipFileDir)) {
    console.warn(
      moduleName + 'downloadManager.unzipPkgDir():No files to unzip.'
    );
    return;
  }
  let dirent = fs.readdirSync(zipFileDir, {
    encoding: 'utf8',
    withFileTypes: false
  });
  if (dirent.length == 0) {
    console.warn(
      moduleName + 'downloadManager.unzipPkgDir():No files to unzip.'
    );
    return;
  }

  for (let zipFile of dirent) {
    await unzipPkg(path.resolve(zipFileDir, zipFile), unzipDir, filterDir, filterExec);
  }
  //fs.rmdirSync(zipFileDir);
}

async function unzipPkg(zipFile, unzipDir, filterDir, filterExec) {
  console.info(
    moduleName +
      'downloadManager.unzipPkg(): zipFile = ' +
      zipFile +
      ', unzipDir = ' +
      unzipDir +
      ', filterDir = ' +
      filterDir
  );
  if (!fs.existsSync(zipFile)) {
    console.warn(moduleName + 'downloadManager.unzipPkg():No files to unzip.');
    return;
  }

  if (filterDir == undefined) {
    filterDir = '';
  }

  await decompress(zipFile, unzipDir, {
    filter: file => {
      const ret = filterExec.find(element => element === file.path);
      if (ret === undefined)
        return false;
      else
        return true;
    },
    map: file => {
      if (filterDir == '') {
        file.path = file.path.substring(0);
      } else {
        file.path = file.path.substring(filterDir.length + 1);
      }
      return file;
    }
  });
  console.info(
    moduleName + `downloadManager.unzipPkg: unzip tool ${zipFile} finish.`
  );
  fs.unlinkSync(zipFile);
}

function makeFilePath(pathName) {
  if (fs.existsSync(pathName)) {
    return true;
  } else {
    if (makeFilePath(path.dirname(pathName))) {
      fs.mkdirSync(pathName);
      return true;
    }
  }
}

module.exports = {
  getPackageInfo,
  downloadPkg,
  downloadPkgFormPath,
  unzipPkgDir,
  unzipPkg,
};
