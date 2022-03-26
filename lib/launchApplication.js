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

    let results = await controller.start();
    
    let webApp;
    if (wgtFilePath) {
        if (!fs.existsSync(wgtFilePath)) {
            logger.error('Invalid `.wgt` file reference specified.');
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
                    logger.error(`Error occurred while processing \`config.xml\`, ${err}`);
                }
                configJson = result;
            });
        }
        if (!configJson) {
            logger.error('Invalid `.wgt` package file selected. Package parsing failed.');
            return;
        }
        // get the application id from `config.xml`
        const applicationId = configJson.widget['tizen:application'][0]['$'].id;
        const [packageId, name] = applicationId.split('.');

        webApp = new TVWebApp(name, path.dirname(wgtFilePath), packageId);
    } else {
        webApp = TVWebApp.openProject(vscode.workspace.rootPath);
        if (!webApp) {
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
            if (!chromeExecPath) {
                chromeExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
        case 'Run On TV':
            logger.log('launchApplication:Run On TV');
            targetIP = configUtil.getConfig(configUtil.TARGET_IP);
            if (!targetIP) {
                targetIP = await configUtil.userInputConfig(
                    configUtil.TARGET_IP
                );
            }

            try {
                await webApp.launchOnTV(targetIP, chromeExecPath, isDebug);
            } catch(error) {
                logger.log('launchApplication: Failed to launch application');
                logger.log('launchApplication: Error: ' + error)
            }

            break;
        case 'Debug On TV Emulator':
            logger.log('launchApplication:Debug On TV Emulator');
            chromeExecPath = configUtil.getConfig(configUtil.CHROME_EXEC);
            if (!chromeExecPath) {
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
            if (!simulatorExecPath) {
                simulatorExecPath = await configUtil.userInputConfig(
                    configUtil.CHROME_EXEC
                );
            }
            webApp.launchOnSimulator(simulatorExecPath);
            break;
    }
};
