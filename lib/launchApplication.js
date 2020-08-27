const vscode = require('vscode');
const TVWebApp = require('@tizentv/webide-common-tizentv').TVWebApp;
const StepController = require('./inputStepController').StepController;
const configUtil = require('./configUtil');

module.exports = async function launchApplication(isDebug) {
    let controller = new StepController();
    if (isDebug) {
        controller.addStep({
            title: 'Debug Application',
            items: ['Debug On TV', 'Debug On TV Emulator'].map(label => ({label}))
        });
    } else {
        controller.addStep({
            title: 'Launch Application',
            items: ['Run On TV', 'Run On TV Emulator', 'Run On TV Simulator'].map(label => ({label}))
        });
    }
    
    let results = await controller.start();

    let webApp = TVWebApp.openProject(vscode.workspace.rootPath);
    if (webApp == null) {
        return;
    }

    let targetIP = null;
    let chromeExecPath = null;
    switch (results[0]) {
        case 'Debug On TV':
            chromeExecPath = configUtil.getConfig(configUtil.CHROME_EXEC);
            if (chromeExecPath == null) {
                chromeExecPath = await configUtil.userInputConfig(configUtil.CHROME_EXEC);
            }
        case 'Run On TV':
            targetIP = configUtil.getConfig(configUtil.TARGET_IP);
            if (targetIP == null) {
                targetIP = await configUtil.userInputConfig(configUtil.TARGET_IP);
            }
            await webApp.launchOnTV(targetIP, chromeExecPath, isDebug);
            break;
        case 'Debug On TV Emulator':
            chromeExecPath = configUtil.getConfig(configUtil.CHROME_EXEC);
            if (chromeExecPath == null) {
                chromeExecPath = await configUtil.userInputConfig(configUtil.CHROME_EXEC);
            }
        case 'Run On TV Emulator':      
            webApp.launchOnEmulator(chromeExecPath, isDebug);
            break;
        case 'Run On TV Simulator':
            let simulatorExecPath = configUtil.getConfig(configUtil.SIMULATOR_EXEC);
            if (simulatorExecPath == null) {
                simulatorExecPath = await configUtil.userInputConfig(configUtil.CHROME_EXEC);
            }
            webApp.launchOnSimulator(simulatorExecPath);
            break;
    }
}