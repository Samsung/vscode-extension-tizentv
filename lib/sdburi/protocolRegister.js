const ProtocolRegistry = require("protocol-registry");
const constants = require('./constants');
const fsExtra = require('fs-extra');
const { spawnSync } = require('child_process');
const { join } = require('path');
const fs = require('fs');

async function protocolRegisterWindows(){
    await ProtocolRegistry.register({
        protocol: "sdburi",
        command: constants.protocol.command,
        override: true,
        terminal: false
    });
}


async function protocolRegisterMac(){
    spawnSync(join(constants.sdburiPath.dir, 'script.sh'));
}


async function protocolRegisterLinux(){
    let home = join(require('os').homedir());
    let applicationsPath = join(home, '.local/share/applications');
    fsExtra.moveSync(join(constants.sdburiPath.dir, 'sdburi.desktop'),
      join(applicationsPath, 'sdburi.desktop'),
      {overwrite: true}
    );
    spawnSync('xdg-mime', ['default', 'sdburi.desktop', 'x-scheme-handler/sdburi']);
}

async function protocolRegister(){
    if (process.platform === 'win32'){
        return protocolRegisterWindows();
    } else if (process.platform === 'darwin'){
        return protocolRegisterMac();
    } else {
        return protocolRegisterLinux();
    }
}

module.exports = {
    protocolRegister
};