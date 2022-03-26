const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const xml2js = require('xml2js');
const TVWebApp = require('@tizentv/webide-common-tizentv').TVWebApp;

const StepController = require('./inputStepController').StepController;
const configUtil = require('./configUtil');
const { getTizenTvOutputCommand } = require('./outputCommander');
const { logger } = require('./logger');

const logInfo = (msg) => logger.log(`TizenTV: ${msg}`);
const logError = (msg) => logger.error(`TizenTV: ${msg}`);

module.exports = async function launchApplication(isDebug, wgtFilePath) {
    getTizenTvOutputCommand().show(true);

    logInfo(`Launch Application${isDebug ? ' with debug' : ''}`);
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

    let results = await controller.start();
    
    let webApp;
    if (wgtFilePath) {
        if (!fs.existsSync(wgtFilePath)) {
            logError('Invalid `.wgt` file reference specified.');
            return;
        }
        // Decompress .wgt package and read config.xml file content to get package id
        const configFile = await decompress(wgtFilePath, '', {
            filter: file => file.path === 'config.xml'
        });
        let configJson = null;
        if (configFile && configFile.length > 0) {
            xml2js.parseString(configFile[0].data.toString(), function (error, result) {
                if (error) {
                    logError(`Error occurred while processing \`config.xml\`, ${err}`);
                }
                configJson = result;
            });
        }
        if (!configJson) {
            logError('Invalid `.wgt` package file selected. Package parsing failed.');
            return;
        }
        // get the application id from `config.xml`
        const applicationId = configJson.widget['tizen:application'][0]['$'].id;
        const [packageId, name] = applicationId.split('.');

        webApp = new TVWebApp(name, path.dirname(wgtFilePath), packageId);
    } else {
        webApp = TVWebApp.openProject(vscode.workspace.rootPath);
        if (!webApp) {
            logError('webApp is null');
            return;
        }
    }

    let targetIP = null;
    let chromeExecPath = null;
    switch (results[0]) {
        case 'Debug On TV':
            logInfo('Debug On TV');
            chromeExecPath = configUtil.getConfig(configUtil.CHROME_EXEC);
            if (!chromeExecPath) {
                chromeExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
            logInfo(`Chrome application path :: ${chromeExecPath}`);

        case 'Run On TV':
            logInfo('Run On TV');
            targetIP = configUtil.getConfig(configUtil.TARGET_IP);
            if (!targetIP) {
                targetIP = await configUtil.userInputConfig(
                    configUtil.TARGET_IP
                );
            }
            logInfo(`Target IP :: ${targetIP}`);
            try {
                await webApp.launchOnTV(targetIP, chromeExecPath, isDebug);
                logInfo('Application launched');
                vscode.window.showInformationMessage(`Launched '${webApp.id}.${webApp.name}' on ${targetIP}.`);
            } catch(error) {
                logError('Failed to launch application');
                vscode.window.showErrorMessage(`TizenTV: ${error.toString()}`);
            }
            break;
        case 'Debug On TV Emulator':
            logInfo('Debug On TV Emulator');
            chromeExecPath = configUtil.getConfig(configUtil.CHROME_EXEC);
            if (!chromeExecPath) {
                chromeExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
            logInfo(`Chrome executable path :: ${chromeExecPath}`);

        case 'Run On TV Emulator':
            logInfo('Run On TV Emulator');
            webApp.launchOnEmulator(chromeExecPath, isDebug);
            logInfo('Application launched');
            break;
        case 'Run On TV Simulator':
            logInfo('Run On TV Simulator');
            let simulatorExecPath = configUtil.getConfig(
                configUtil.SIMULATOR_EXEC
            );
            if (!simulatorExecPath) {
                simulatorExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
            logInfo(`Simulator executable path :: ${simulatorExecPath}`);
            webApp.launchOnSimulator(simulatorExecPath);
            logInfo('Application launched');
            break;
    }
};
