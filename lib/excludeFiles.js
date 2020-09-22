const vscode = require('vscode');
const path = require('path');
const configUtil = require('./configUtil');

module.exports = function excludeFiles(uri) {
    console.info('excludeFiles: ' + uri.fsPath);
    if (uri.fsPath == vscode.workspace.rootPath) {
        let msg = uri.fsPath + ' is project root path!';
        console.info(msg);
        vscode.window.showInformationMessage(msg);
        return;
    }

    let excludeFiles = configUtil.getConfig(configUtil.EXCLUDE_FILES);
    console.info('excludeFiles: ' + excludeFiles);

    if (null == excludeFiles || '' == excludeFiles) {
        excludeFiles = uri.fsPath;
    } else {
        let exFileArr = excludeFiles.split(',');
        for (i = 0; i < exFileArr.length; i++) {
            if (exFileArr[i] == uri.fsPath || exFileArr[i] == path.dirname(uri.fsPath)) {
                let msg = uri.fsPath + ' is excluded!';
                console.info(msg);
                vscode.window.showInformationMessage(msg);
                return;
            }
        }

        excludeFiles = excludeFiles + ',' + uri.fsPath;
    }

    vscode.workspace.getConfiguration('tizentv').update(configUtil.EXCLUDE_FILES, excludeFiles, false);
    vscode.window.showInformationMessage(uri.fsPath + ' is excluded successful!');
}