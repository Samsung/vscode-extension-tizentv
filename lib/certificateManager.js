const fs = require('fs');
const path = require('path');
const { StepController } = require('./inputStepController');
const { InputValidator } = require('./inputValidator');
const importCertificate = require('./importCertificate');
const common = require('./common');
const TizenCM = require('@tizentv/webide-common-tizentv').TizenCM;
const ProfileManager = require('@tizentv/webide-common-tizentv').ProfileManager;

async function createTizenCertificate() {
    let passwordTemp = '';

    function checkPassword(value) {
        if (value == undefined || value.length < 8) {
            return 'The password must contain at least 8 characters.';
        }

        passwordTemp = value;
        return null;
    }

    function confirmPassword(value) {
        if (value != passwordTemp) {
            return 'The passwords do not match.'
        }

        return null;
    }

    let tizenCertMgr = new TizenCM(common.resourcePath);
    await tizenCertMgr.init();
    let controller = new StepController();

    controller.addStep({
        title:'Create Certificate Profile',
        totalSteps: 6,
        step: 1,
        prompt: 'Enter profile name',
        validator: InputValidator.checkCertificateProfileName
    });

    controller.addStep({
        title:'Create Certificate Profile',
        totalSteps: 6,
        step: 2,
        prompt: 'Enter key filename',
        validator: InputValidator.checkCertificateFileName
    });

    controller.addStep({
        title:'Create Certificate Profile',
        totalSteps: 6,
        step: 3,
        prompt: 'Enter author name',
        validator: InputValidator.checkCertificateAuthorName
    });

    controller.addStep({
        title:'Create Certificate Profile',
        totalSteps: 6,
        step: 4,
        prompt: 'Enter password',
        password: true,
        validator: checkPassword
    });

    controller.addStep({
        title:'Create Certificate Profile',
        totalSteps: 6,
        step: 5,
        prompt: 'Confirm password',
        password: true,
        validator: confirmPassword
    });

    controller.addStep({
        title: 'Create Certificate Profile',
        totalSteps: 6,
        step: 6,
        items: ['Use default distributor certificate - Public privilege', 'Use default distributor certificate - Partner privilege'].map(label => ({label}))
    });

    let result = await controller.start();
    let profileName = result[0];
    let keyFileName = result[1];
    let authorName = result[2];
    let authorPassword = result[4];
    let privilege = result[5] == 'Use default distributor certificate - Public privilege' ? 'public' : 'partner';
    let keyFilePath = common.authorPath + path.sep + keyFileName + '.p12';

    tizenCertMgr.createCert({
        keyFileName: keyFileName,
        authorName: authorName,
        authorPassword: authorPassword,
        countryInfo: '',
        stateInfo: '',
        cityInfo: '',
        organizationInfo: '',
        departmentInfo: '',
        emailInfo: ''});

    let profileMgr = new ProfileManager(common.resourcePath);
    let authorProfile = {
        authorCA: tizenCertMgr.getTizenDeveloperCA(),
        authorCertPath: keyFilePath,
        authorPassword: authorPassword
    };
    let distributorProfile = tizenCertMgr.getTizenDistributorProfile(privilege);
    profileMgr.registerProfile(profileName, authorProfile, distributorProfile);
}

async function setActiveProfile() {
    let controller = new StepController();
    let profileMgr = new ProfileManager(common.resourcePath);
    let profileList = profileMgr.listProfile();

    controller.addStep({
        title: 'Set Active Profile',
        items: profileList.map(label => ({label}))
    });

    let result = await controller.start();
    profileMgr.setActivateProfile(result[0]);
}

async function removeProfile() {
    let controller = new StepController();
    let profileMgr = new ProfileManager(common.resourcePath);
    let profileList = profileMgr.listProfile();
    if (null == profileList) {
        console.error('profileList = ' + profileList + ', please add your profile');
    }

    controller.addStep({
        title: 'Remove Profile',
        items: profileList.map(label => ({label}))
    });

    let result = await controller.start();
    let keys = profileMgr.getProfileKeys(result[0]);
    fs.unlinkSync(keys[0]);
    profileMgr.removeProfile(result[0]);
}

module.exports = async function certificateManager() {
    let controller = new StepController();

    controller.addStep({
        title: 'Certificate Manager',
        items: ['Create Profile (Tizen)', /*'Import Certificate',*/ 'Remove Profile', 'Set Active Profile'].map(label => ({label}))
    });

    let res1 = await controller.start();
    let opt = res1[0];

    switch(opt) {
        case 'Create Profile (Tizen)':
            await createTizenCertificate();
            break;
        case 'Import Certificate':
            await importCertificate();
            break;
        case 'Remove Profile':
            await removeProfile();
            break;
        case 'Set Active Profile':
            await setActiveProfile();
            break;
    }
}