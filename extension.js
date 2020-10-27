const vscode = require('vscode');
const createProject = require('./lib/createProject');
const buildPackage = require('./lib/buildPackage');
const certificateManager = require('./lib/certificateManager');
const launchWits = require('./lib/witsLauncher');
const launchApplication = require('./lib/launchApplication');
const excludeFiles = require('./lib/excludeFiles');
const witsOutput = require('./lib/witsOutput');
const tizentvOutput = require('./lib/extensionOutput');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.createProject', async () =>
            createProject()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.buildPackage', () =>
            buildPackage()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'tizentv.certificateManager',
            async () => certificateManager()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.launchApplication', async () =>
            launchApplication(false)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.debugApplication', async () =>
            launchApplication(true)
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsStart', async () =>
            launchWits('start')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsWatch', async () =>
            launchWits('watch')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsStop', async () =>
            launchWits('stop')
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.excludeFiles', async uri =>
            excludeFiles(uri)
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsShowOutput', async () =>
            witsOutput.showOutput()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsHideOutput', async () =>
            witsOutput.hideOutput()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.witsClearOutput', async () =>
            witsOutput.clearOutput()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.tizentvShowOutput', async () =>
            tizentvOutput.showOutput()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tizentv.tizentvHideOutput', async () =>
            tizentvOutput.hideOutput()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'tizentv.tizentvClearOutput',
            async () => tizentvOutput.clearOutput()
        )
    );
}
exports.activate = activate;

// This method is called when your extension is deactivated
function deactivate() {
    // Do nothing
}
exports.deactivate = deactivate;
