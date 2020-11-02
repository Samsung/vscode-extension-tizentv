const { fileURLToPath } = require('url');
const vscode = require('vscode');
const TVWebApp = require('@tizentv/webide-common-tizentv').TVWebApp;

const templateHelper = require('./templateHelper');
const { StepController } = require('./inputStepController');
const { InputValidator } = require('./inputValidator');
const { getTizenTvOutputCommand } = require('./outputCommander');
const { logger } = require('./logger');

module.exports = async function createProject() {
    getTizenTvOutputCommand().show(true);
    logger.log(`Create Project : run create project`);
    let controller = new StepController();
    controller.addStep({
        title: 'Define Project Properties',
        totalSteps: 3,
        step: 1,
        placeholder: 'Select the project type',
        prompt: 'Select the project type',
        items: templateHelper.getTemplateList().map(label => ({ label }))
    });

    controller.addStep({
        title: 'Define Project Properties',
        totalSteps: 3,
        step: 2,
        placeholder: 'Enter Project Name',
        prompt: 'Enter Project Name',
        validator: InputValidator.checkAppName
    });

    let folderBtn = StepController.FileBroswer;
    folderBtn.bindAction(async function (thisInput) {
        let folder = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true
        });
        if (folder) {
            thisInput.value = fileURLToPath(folder[0].toString(true));
        }
    });

    controller.addStep({
        title: 'Define Project Properties',
        totalSteps: 3,
        step: 3,
        placeholder: 'Enter Project Location',
        prompt: 'Enter Project Location',
        buttons: [folderBtn],
        validator: InputValidator.checkDirectory
    });

    let results = await controller.start();

    const template = results.shift();
    const projectName = results.shift();
    const projectLocation = results.shift();

    templateHelper.copyTemplate(template, projectLocation);
    const webApp = new TVWebApp(projectName, projectLocation);
    webApp.init();
    await vscode.commands.executeCommand(
        'vscode.openFolder',
        vscode.Uri.file(projectLocation)
    );
};
