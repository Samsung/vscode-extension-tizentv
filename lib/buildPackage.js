const vscode = require('vscode');
const path = require('path');
const TVWebApp = require('@tizentv/webide-common-tizentv').TVWebApp;
const configUtil = require('./configUtil');

const profilePath = path.resolve(__dirname, '..', 'resource', 'profiles.xml');

module.exports = async function buildPackage() {
    let webApp = TVWebApp.openProject(vscode.workspace.rootPath);
    if (webApp == null) {
        return;
    }

    try {
        let excludeFiles = configUtil.getConfig(configUtil.EXCLUDE_FILES);
        await webApp.buildWidget(profilePath, excludeFiles);

        var buildSuccessMsg = 'Build the package Successfully!';
        vscode.window.showInformationMessage(buildSuccessMsg);
    } catch(ex) {
        var errorMsg = 'Build failed: ' + ex;
        vscode.window.showInformationMessage(errorMsg);
    }
}