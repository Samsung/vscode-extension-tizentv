const vscode = require('vscode');
const createProject = require('./lib/createProject');
const buildPackage = require('./lib/buildPackage');
const certificateManager = require('./lib/certificateManager');
const launchWits = require('./lib/witsLauncher');
const launchApplication = require('./lib/launchApplication');
const excludeFiles = require('./lib/excludeFiles');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.createProject', async () => createProject())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.buildPackage', () => buildPackage())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.certificateManager', async () => certificateManager())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.launchApplication', async () => launchApplication(false))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.debugApplication', async () => launchApplication(true))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsStart', async () => launchWits('start'))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsWatch', async () => launchWits('watch'))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsStop', async () => launchWits('stop'))
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.excludeFiles',async (uri) => excludeFiles(uri))
    );
}
exports.activate = activate;

// This method is called when your extension is deactivated
function deactivate() {
    // Do nothing
}
exports.deactivate = deactivate;