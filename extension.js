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
const configUtil = require('./lib/configUtil');
const { getConnectedDeviceList } = require('./lib/common');

const {
  getWitsOutputCommand,
  getTizenTvOutputCommand
} = require('./lib/outputCommander');

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
    vscode.commands.registerCommand('tizentv.certificateManager', async () =>
      certificateManager()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.launchApplication', async file => {
      if (file && file.fsPath && path.extname(file.fsPath) === '.wgt') {
        launchApplication(false, file.fsPath);
      } else {
        launchApplication(false);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.debugApplication', async file => {
      if (file && file.fsPath && path.extname(file.fsPath) === '.wgt') {
        launchApplication(true, file.fsPath);
      } else {
        launchApplication(true);
      }
    })
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
      getWitsOutputCommand().show()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('tizentv.tizentvShowOutput', async () =>
      getTizenTvOutputCommand().show()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tizentv.setTargetDeviceAddress',
      async () => {
        console.log('setTargetDevice........');
        const INPUT_ADDRESS = 'Input Target Device Address';
        const connectedDevice = await getConnectedDeviceList();
        const quickpickList = [...connectedDevice, INPUT_ADDRESS];
        let targetDeviceAddress = '';
        if (quickpickList.length === 1) {
          targetDeviceAddress = await getTargetDeviceAddress();
        } else {
          const picked = await vscode.window.showQuickPick(quickpickList);
          if (picked === INPUT_ADDRESS) {
            targetDeviceAddress = await getTargetDeviceAddress();
          } else {
            targetDeviceAddress = picked;
          }
        }

        if (targetDeviceAddress) {
          await vscode.workspace
            .getConfiguration('tizentv')
            .update(configUtil.TARGET_IP, targetDeviceAddress, true);
        }
      }
    )
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

async function getTargetDeviceAddress() {
  const currentTargetDeviceAddress = vscode.workspace
    .getConfiguration('tizentv')
    .get(configUtil.TARGET_IP);

  const deviceAddress = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    title: 'Input Target Device Address',
    placeHolder: 'Input Target Device Address',
    value: currentTargetDeviceAddress
  });

  return deviceAddress;
}
