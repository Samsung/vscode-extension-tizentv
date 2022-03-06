const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const TVWebApp = require('@tizentv/webide-common-tizentv').TVWebApp;

const StepController = require('./inputStepController').StepController;
const { InputValidator } = require('./inputValidator');
const configUtil = require('./configUtil');
const { getTizenTvOutputCommand } = require('./outputCommander');
const { logger } = require('./logger');

module.exports = async function launchApplication(isDebug, wgtFilePath) {
    getTizenTvOutputCommand().show(true);

    logger.log(`Launch Application${isDebug ? ' with debug' : ''}`);
    let controller = new StepController();
    if (isDebug) {
        controller.addStep({
            title: 'Debug Application',
            items: ['Debug On TV', 'Debug On TV Emulator'].map(label => ({
                label
            }))
        });
    } else {
        controller.addStep({
            title: 'Launch Application',
            items: [
                'Run On TV',
                'Run On TV Emulator',
                'Run On TV Simulator'
            ].map(label => ({ label }))
        });
    }

    if (wgtFilePath) {
        controller.addStep({
            title: 'Package ID',
            placeholder: 'Enter package id',
            validator: InputValidator.checkPackageId
        });
    }

    let results = await controller.start();
    
    let webApp;
    if (wgtFilePath) {
        if (!fs.existsSync(wgtFilePath)) {
            logger.log('Invalid `.wgt` file reference specified.');
            return;
        }
        webApp = new TVWebApp(path.basename(wgtFilePath, '.wgt'), path.dirname(wgtFilePath), results[1]);
    } else {
        webApp = TVWebApp.openProject(vscode.workspace.rootPath);
        if (webApp == null) {
            logger.log('launchApplication:web App is null');
            return;
        }
    }

    let targetIP = null;
    let chromeExecPath = null;
    switch (results[0]) {
        case 'Debug On TV':
            logger.log('launchApplication:Debug On TV');
            chromeExecPath = configUtil.getConfig(configUtil.CHROME_EXEC);
            if (chromeExecPath == null) {
                chromeExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
        case 'Run On TV':
            logger.log('launchApplication:Run On TV');
            targetIP = configUtil.getConfig(configUtil.TARGET_IP);
            if (targetIP == null) {
                targetIP = await configUtil.userInputConfig(
                    configUtil.TARGET_IP
                );
            }
            await webApp.launchOnTV(targetIP, chromeExecPath, isDebug);
            break;
        case 'Debug On TV Emulator':
            logger.log('launchApplication:Debug On TV Emulator');
            chromeExecPath = configUtil.getConfig(configUtil.CHROME_EXEC);
            if (chromeExecPath == null) {
                chromeExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
        case 'Run On TV Emulator':
            logger.log('launchApplication:Run On TV Emulator');
            webApp.launchOnEmulator(chromeExecPath, isDebug);
            break;
        case 'Run On TV Simulator':
            logger.log('launchApplication:Run On TV Simulator');
            let simulatorExecPath = configUtil.getConfig(
                configUtil.SIMULATOR_EXEC
            );
            if (simulatorExecPath == null) {
                simulatorExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
            webApp.launchOnSimulator(simulatorExecPath);
            break;
    }
};
