const vscode = require('vscode');
const { TVWebApp } = require('@tizentv/webide-common-tizentv');
const configUtil = require('./configUtil');
const { getTizenTvOutputCommand } = require('./outputCommander');
const { logger } = require('./logger');
const { profilePath } = require('./common');

module.exports = async function buildPackage() {
  getTizenTvOutputCommand().show(true);
  const webApp = TVWebApp.openProject(vscode.workspace.rootPath);
  if (webApp == null) {
    return;
  }

  try {
    const excludeFiles = configUtil.getConfig(configUtil.EXCLUDE_FILES);
    await webApp.buildWidget(profilePath, excludeFiles);

    const buildSuccessMsg = 'Build the package Successfully!';
    logger.log(`Build Package (${buildSuccessMsg})`);
    vscode.window.showInformationMessage(buildSuccessMsg);
  } catch (ex) {
    const errorMsg = `Build failed: ${ex}`;
    logger.error(`Build Package (${errorMsg})`);
    vscode.window.showInformationMessage(errorMsg);
  }
};
