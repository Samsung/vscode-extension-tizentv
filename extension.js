const vscode = require('vscode');
const path = require('path');
const { checkTizenStudioDataDirectory } = require('./lib/common');
const createProject = require('./lib/createProject');
const buildPackage = require('./lib/buildPackage');
const certificateManager = require('./lib/certificateManager');
const launchWits = require('./lib/witsLauncher');
const launchApplication = require('./lib/launchApplication');
const excludeFiles = require('./lib/excludeFiles');
const sdburiInstaller = require('./lib/sdburi/sdbUriInstaller');
const {
  getWitsOutputCommand,
  getTizenTvOutputCommand,
} = require('./lib/outputCommander');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.createProject', async () => createProject()),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.buildPackage', () => buildPackage()),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tizentv.certificateManager',
      async () => certificateManager(),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.launchApplication', async (file) => {
      if (file && file.fsPath && path.extname(file.fsPath) === '.wgt') {
        launchApplication(false, file.fsPath);
      } else {
        launchApplication(false);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.debugApplication', async (file) => {
      if (file && file.fsPath && path.extname(file.fsPath) === '.wgt') {
        launchApplication(true, file.fsPath);
      } else {
        launchApplication(true);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.witsStart', async () => launchWits('start')),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.witsWatch', async () => launchWits('watch')),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.witsStop', async () => launchWits('stop')),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.excludeFiles', async (uri) => excludeFiles(uri)),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.witsShowOutput', async () => getWitsOutputCommand().show()),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.tizentvShowOutput', async () => getTizenTvOutputCommand().show()),
  );

  sdburiInstaller.installSdburi();
  checkTizenStudioDataDirectory();
}
exports.activate = activate;

// This method is called when your extension is deactivated
function deactivate() {
  // Do nothing
}
exports.deactivate = deactivate;
