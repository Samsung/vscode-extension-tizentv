const tools = require('@tizentv/tools');
const { join } = require('path');

const windowsBinExtension = '.exe';
const getPlatformExtension = () => {
    if (process.platform === platforms.windows)
        return windowsBinExtension;
    else
        return '';
};

const getPlatformSdburiDir = () => {
    if (process.platform === platforms.windows)
        return 'sdburi';
    else
        return '.sdburi';
}; 

const getPlatformHome = () => {
    let home = join(require('os').homedir());
    if (process.platform === platforms.windows)
        return join(home, 'AppData\\Local');
    else
        return home;
};

const getPlatformProtocolArgument = () => {
    if (process.platform === platforms.windows){
        return '%1';
    } else if (process.platform === platforms.macos){
        return `" & this_URL & "`;
    } else {
        return '%u';
    }
};

const getPlatformFilterExec = () => {
    if (process.platform === platforms.windows){
        return ['data/tools/sdburi/sdburi' + getPlatformExtension()];
    } else if (process.platform === platforms.macos){
        return ['data/tools/sdburi/sdburi' + getPlatformExtension(),
            'data/tools/sdburi/URL-sdburi.script',
            'data/tools/sdburi/script.sh'];
    } else {
        return ['data/tools/sdburi/sdburi' + getPlatformExtension(),
            'data/tools/sdburi/sdburi.desktop'];
    }
};

const getPlatformProtocolCommand = () => {
    let binPath = join(getPlatformHome(), getPlatformSdburiDir(), 'sdburi' + getPlatformExtension());
    return binPath + " \"" + getPlatformProtocolArgument() + "\"";
};

const getCurrentPlatformName = () => {
    return process.platform === 'win32'
      ? `windows`
      : process.platform === 'linux'
      ? `ubuntu`
      : 'macos';
}

const getCurrentPlatformBit = () => {
    return process.arch === 'x64' ? '64' : '32';
}

const platforms =  {
    windows: 'win32',
    linux: 'linux',
    macos: 'darwin',
    currentPlatformName: getCurrentPlatformName(),
    currentPlatformBit: getCurrentPlatformBit()
};

const constants = {
    sdburiDownloadUrl : 'https://sdf.samsungcloudcdn.com/Public/smart_tv_sdk/releases/samsung_tizen_studio_tv_sdk/stv_ext_public/TV',
    sdburiPath: {
        name: 'sdburi',
        exec: 'sdburi' + getPlatformExtension(),
        filterDir: 'data/tools/sdburi',
        filterExec: getPlatformFilterExec(),
        dir: join(getPlatformHome(), getPlatformSdburiDir()),
        path: join(getPlatformHome(), getPlatformSdburiDir(), 'sdburi' + getPlatformExtension()),

    },
    sdbPath: {
        name: 'sdb',
        exec: 'sdb' + getPlatformExtension(),
        path: tools.getSdbPath()
    },
    protocol:{
        command: getPlatformProtocolCommand()
    }
};

module.exports = {
    constants,
    platforms
};
