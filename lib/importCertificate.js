const vscode = require('vscode');
const fs = require('fs');
const { fileURLToPath } = require('url');
const { StepController } = require('./inputStepController');
const { InputValidator } = require('./inputValidator');
const cryptUtil = require('./cryptUtil');
//const profileEditor = require('./profileEditor');
const { logger } = require('./logger');

var certFileTemp = null;

function checkCertificateDir(certDir) {
    logger.log('importCertificate[checkCertificateDir]:start(${certDir})');
	validatation = InputValidator.checkDirectory(certDir)
	if (validatation) {
		return validatation;
	}

	if (!fs.existsSync(certDir)) {
		logger.log('importCertificate[checkCertificateDir]: Certificate file not found');
		return 'Certificate file not found.'
	}

	certFileTemp = certDir;
	return null;
}

function checkCertficatePassword(password) {
    logger.log('importCertificate[checkCertficatePassword]: start(${password})');
	if (cryptUtil.checkP12Password(certFileTemp, password)) {
		return null;
	} else {
		logger.log('importCertificate[checkCertficatePassword]: password is incorrect');
		return 'The password you entered is incorrect.';
	}
}

function importAuthorCertificate(controller, totalSteps, step) {
	logger.log('importCertificate[importAuthorCertificate]:start');
	let folderBtn = StepController.FileBroswer;
	folderBtn.bindAction(async function(thisInput) {
		let folder = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false
		});
		if (folder) {
			thisInput.value = fileURLToPath(folder[0].toString(true));
		}
	});

	controller.addStep({
		title:'Import Certificate - Author',
		totalSteps: totalSteps,
		step: step++,
		prompt: 'Enter certificate file location',
		buttons: [folderBtn],
		validator: checkCertificateDir
	});

	controller.addStep({
		title:'Import Certificate - Author',
		totalSteps: totalSteps,
		step: step++,
		prompt: 'Enter certificate file password',
		password: true,
		validator: checkCertficatePassword
	});
}

function importDistributorCertificate(controller, totalSteps, step) {
	logger.log('importCertificate[importDistributorCertificate]: start');
	let folderBtn = StepController.FileBroswer;
	folderBtn.bindAction(async function(thisInput) {
		let folder = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false
		});
		if (folder) {
			thisInput.value = fileURLToPath(folder[0].toString(true));
		}
	});

	controller.addStep({
		title:'Import Certificate - Distributor',
		totalSteps: totalSteps,
		step: step++,
		prompt: 'Enter certificate file location',
		buttons: [folderBtn],
		validator: checkCertificateDir
	});

	controller.addStep({
		title:'Import Certificate - Distributor',
		totalSteps: totalSteps,
		step:  step++,
		prompt: 'Enter certificate file password',
		password: true,
		validator: checkCertficatePassword
	});
}

module.exports = async function importCertificate() {
	logger.log('importCertificate: start');

	let controller = new StepController();
	
    controller.addStep({
		title: 'Import certificate profile',
		items: ['Author Certificate', 'Distributor Certificate', 'Author & Distributor Certificate'].map(label => ({label}))
	});

	let totalSteps = 0;
	let step = 0;
	let checkAuthor = false;
	let checkDistributor = false;
	let res1 = await controller.start();

	switch (res1[0]) {
		case 'Author Certificate':
			totalSteps = 3;
			checkAuthor = true;
			logger.log('importCertificate: Author Certificate');
			break;
		case 'Distributor Certificate':
			totalSteps = 3;
			checkDistributor = true;
			logger.log('importCertificate: Distributor Certificate');
			break;
		case 'Author & Distributor Certificate':
			totalSteps = 5;
			checkAuthor = true;
			checkDistributor = true;
			logger.log('importCertificate: Author & Distributor Certificate');
			break;
	}

	controller.reset();

	controller.addStep({
		title:'Import Certificate Profile',
		totalSteps: totalSteps,
		step: 1,
		prompt: 'Enter profile name',
		validator: InputValidator.checkCertificateProfileName
	});
	step += 1;

	if (checkAuthor) {
		importAuthorCertificate(controller, totalSteps, step);
		step += 2;
	}
	if (checkDistributor) {
		importDistributorCertificate(controller, totalSteps, step);
	}

	let res2 = await controller.start();
	step = 0;
/*
	profileEditor.createProfile(res2[step++], checkAuthor == true ? {
        key: res2[step++],
        password: cryptUtil.encryptPassword(res2[step++])
    } : undefined, checkDistributor == true ? {
        key: res2[step++],
        password: cryptUtil.encryptPassword(res2[step++])
    } : undefined, undefined, true);
*/
}