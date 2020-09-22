const fs = require('fs');
const vscode = require('vscode');
const wits = require('@tizentv/wits');
const TVWebApp = require('@tizentv/webide-common-tizentv').TVWebApp;
const common = require('./common');
const configUtil = require('./configUtil');

module.exports = async function launchWits(option) {
    if (option == 'stop') {
        wits.disconnect();
        return;
    }
    let webApp = TVWebApp.openProject(vscode.workspace.rootPath);
    if (webApp == null) {
        return;
    }
    let appWidth = webApp.getAppScreenWidth();

    /*
    let targetAddr = configUtil.getConfig(configUtil.TARGET_IP);
    if (targetAddr == null) {
        targetAddr = await configUtil.userInputConfig(configUtil.TARGET_IP);
    }

    let hostAddr = configUtil.getConfig(configUtil.HOST_IP);
    if (hostAddr == null) {
        hostAddr = await configUtil.userInputConfig(configUtil.HOST_IP);
    }
    */

    let connection = await configUtil.checkTVConnection();
    if (connection == undefined) {
        return;
    }
    let debugMode = false;
    if (option == 'start') {
        let select = await vscode.window.showQuickPick(
            [`Wits Start Mode: Debug`, `Wits Start Mode: Normal`],
            {ignoreFocusOut: true}
        );

        if (select == undefined) {
            return;
        } else if (select == `Wits Start Mode: Debug`) {
            debugMode = true;
        }
    }

    let config = {
         deviceIp: connection.target,
         hostIp: connection.host,
         width: appWidth,
         profilePath: common.profilePath,
         baseAppPath: webApp.appLocation,
         isDebugMode: debugMode
    }

    await wits.setWitsconfigInfo(config);

    switch (option) {
        case 'start':
            console.log(`launch wits -start`);
            await wits.start();
            break;
        case 'watch':
            console.log(`launch wits -watch`);
            await wits.watch();
            break;
    }
} 