const ProtocolRegistry = require("protocol-registry");
const constants = require('./constants').constants;
const platforms = require('./constants').platforms;
const fsExtra = require('fs-extra');
const { join } = require('path');
const fs = require('fs');
const sdburiUtils = require("./utils.js");

async function protocolRegisterWindows(){
    await ProtocolRegistry.register({
        protocol: "sdburi",
        command: constants.protocol.command,
        override: true,
        terminal: false
    });
}


async function protocolRegisterMac(){
    await sdburiUtils.exec(join(constants.sdburiPath.dir, 'script.sh'));
}


async function protocolRegisterLinux(){
    let home = join(require('os').homedir());
    let applicationsPath = join(home, '.local/share/applications');
    fsExtra.moveSync(join(constants.sdburiPath.dir, 'sdburi.desktop'),
      join(applicationsPath, 'sdburi.desktop'),
      {overwrite: true}
    );
    await sdburiUtils.exec('xdg-mime default sdburi.desktop x-scheme-handler/sdburi');
}

async function protocolRegister(){
    if (process.platform === platforms.windows){
        return protocolRegisterWindows();
    } else if (process.platform === platforms.macos){
        return protocolRegisterMac();
    } else {
        return protocolRegisterLinux();
    }
}

module.exports = {
    protocolRegister
};
