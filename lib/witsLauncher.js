const vscode = require('vscode');
const wits = require('@tizentv/wits');
const { TVWebApp } = require('@tizentv/webide-common-tizentv');

const common = require('./common');
const configUtil = require('./configUtil');
const { getWitsOutputCommand } = require('./outputCommander');
const { getTizenTvOutputCommand } = require('./outputCommander');
const { logger } = require('./logger');

module.exports = async function launchWits(option) {
  getTizenTvOutputCommand().show(true);
  getWitsOutputCommand().show(true);

  logger.log(`Launch WITs (${option})`);
  if (option === 'stop') {
    wits.disconnect();
    return;
  }
  const webApp = TVWebApp.openProject(vscode.workspace.rootPath);
  if (webApp == null) {
    return;
  }
  const appWidth = webApp.getAppScreenWidth();

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

  const connection = await configUtil.checkTVConnection();
  if (connection === undefined) {
    return;
  }
  let debugMode = false;
  if (option === 'start') {
    const select = await vscode.window.showQuickPick(
      ['Wits Start Mode: Debug', 'Wits Start Mode: Normal'],
      { ignoreFocusOut: true },
    );

    if (select === undefined) {
      return;
    } if (select === 'Wits Start Mode: Debug') {
      debugMode = true;
    }
  }

  const config = {
    deviceIp: connection.target,
    hostIp: connection.host,
    width: appWidth,
    profilePath: common.profilePath,
    baseAppPath: webApp.appLocation,
    isDebugMode: debugMode,
  };

  await wits.setWitsconfigInfo(config);

  switch (option) {
    case 'start':
      logger.log('launch wits -start');
      await wits.start();
      break;
    case 'watch':
      logger.log('launch wits -watch');
      await wits.watch();
      break;
    default:
  }
};
