const vscode = require('vscode');
const path = require('path');
const TVWebApp = require('@tizentv/webide-common-tizentv').TVWebApp;
const configUtil = require('./configUtil');
const { getTizenTvOutputCommand } = require('./outputCommander');
const { logger } = require('./logger');
const { profilePath } = require('./common')

const profilePath = profilePath();

module.exports = async function buildPackage() {
    getTizenTvOutputCommand().show(true);
    let webApp = TVWebApp.openProject(vscode.workspace.rootPath);
    if (webApp == null) {
        return;
    }

    try {
        let excludeFiles = configUtil.getConfig(configUtil.EXCLUDE_FILES);
        await webApp.buildWidget(profilePath, excludeFiles);

        var buildSuccessMsg = 'Build the package Successfully!';
        logger.log(`Build Package (${buildSuccessMsg})`);
        vscode.window.showInformationMessage(buildSuccessMsg);
    } catch (ex) {
        var errorMsg = 'Build failed: ' + ex;
        logger.error(`Build Package (${errorMsg})`);
        vscode.window.showInformationMessage(errorMsg);
    }
};
