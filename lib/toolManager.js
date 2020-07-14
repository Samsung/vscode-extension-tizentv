const fs = require('fs');
const path = require('path');
const readline = require('readline');
const http = require('http');
const download = require('download');
const decompress = require('decompress');

const extensionRoot = path.resolve(__dirname, '..');
const tizenDownloadUrl = 'http://download.tizen.org/sdk/tizenstudio/official';
const bit = process.arch == 'x64' ? '64' : '32';
const platform = process.platform == 'win32' ? `windows-${bit}` : process.platform == 'linux' ? `ubuntu-${bit}` : 'macos-64';
const pkgList = `${tizenDownloadUrl}/pkg_list_${platform}`;

class PackageInfo {
    constructor() {
        this._archived = undefined;
        this.details = {
            version: '',
            path: '',
            sha256: '',
            size: ''
        };
        this.unknownItems = Object.keys(this.details).length;
        console.log(this.details);
    }

    get archived() { return this._archived; }
    set archived(isArchived) { this._archived = isArchived; }
    
    get path() { return this.details.path; }
    get version() { return this.details.version; }
    get sha256() { return this.details.sha256; }
    get size() { return this.details.size; }

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

function checkToolsInfo() {
    return new Promise((resolve, reject) => {
        http.get(pkgList, (res) => {
            if (res.statusCode != 200) {
                reject(new Error(`Failed to archive tools infomation. Code:[${res.statusCode}]`));
            }
            let certificateGeneratorInfo = new PackageInfo();
            let certificateEncryptorInfo = new PackageInfo();
            let sdbInfo = new PackageInfo();

            res.setEncoding('utf8');
            let rl = readline.createInterface({input: res});
            rl.on('line', line => {
                if (certificateGeneratorInfo.archived && certificateEncryptorInfo.archived && sdbInfo.archived) {
                    rl.close();
                }

                if (line.includes('Package : certificate-generator')) {
                    certificateGeneratorInfo.archived = false;
                }
                if (line.includes('Package : certificate-encryptor')) {
                    certificateEncryptorInfo.archived = false;
                }
                if (line.includes('Package : sdb')) {
                    sdbInfo.archived = false;
                }

                if (certificateGeneratorInfo.archived === false) {
                    certificateGeneratorInfo.collectPkgInfo(line);
                } else if (certificateEncryptorInfo.archived === false) {
                    certificateEncryptorInfo.collectPkgInfo(line);
                } else if (sdbInfo.archived === false) {
                    sdbInfo.collectPkgInfo(line);
                }
            });

            rl.on('close', () => {
                resolve({certificateGeneratorInfo, certificateEncryptorInfo, sdbInfo});
            });
        });
    })
}

async function unzipTools() {
    let downloadTmpDir = path.resolve(extensionRoot,'tmp');
    if (!fs.existsSync(downloadTmpDir)) {
        console.log(`No files to unzip.`);
        return;
    }
    let dirent = fs.readdirSync(downloadTmpDir, {encoding: 'utf8', withFileTypes: false});
    if (dirent.length == 0) {
        console.log(`No files to unzip.`);
        return;
    }

    dirent.forEach(async zipFile => {
        await decompress(path.resolve(downloadTmpDir, zipFile), extensionRoot, {
            filter: file => file.path.startsWith('data'),
            map: file => {
                file.path = file.path.substring('data/'.length);
                return file;
            }
        });
        console.log(`unzip tool ${zipFile} finish.`);
    });

    dirent.forEach(zipFile => {
        fs.unlinkSync(path.resolve(downloadTmpDir, zipFile));
    });

    fs.rmdirSync(downloadTmpDir);
}

async function downloadTools() {
    let pkgInfo = await checkToolsInfo();

    let tmpDir = path.resolve(extensionRoot, 'tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }

    if (pkgInfo.certificateGeneratorInfo.path != '') {
        console.log(`Downloading certificate-generator from ${tizenDownloadUrl+pkgInfo.certificateGeneratorInfo.path}...`);
        await download(tizenDownloadUrl+pkgInfo.certificateGeneratorInfo.path, tmpDir);
    }
    if (pkgInfo.certificateEncryptorInfo.path != '') {
        console.log(`Downloading certificate-encryptor from ${tizenDownloadUrl+pkgInfo.certificateEncryptorInfo.path}...`);
        await download(tizenDownloadUrl+pkgInfo.certificateEncryptorInfo.path, tmpDir);
    }
    if (pkgInfo.sdbInfo.path != '') {
        console.log(`Downloading sdb from ${tizenDownloadUrl+pkgInfo.sdbInfo.path}...`);
        await download(tizenDownloadUrl+pkgInfo.sdbInfo.path, tmpDir);
    }

    console.log('Download finished!');
}

module.exports = {

    prepareTools: async function() {
        await downloadTools();
        await unzipTools();
    },

    checkLocalTools: function() {
        if (!fs.existsSync(path.resolve(extensionRoot, 'tools'))) {
            return false;
        }
    }
}