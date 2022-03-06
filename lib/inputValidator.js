const systemPlatform = require('os').platform();
const ProfileManager = require('@tizentv/webide-common-tizentv').ProfileManager;
const common = require('./common');
const { logger } = require('./logger');

function matchReg(value, reg) {
    logger.log('InputValidator: matchReg()');
    let match = value.match(reg);
    if (match != null) {
        if (match.length == 1 && match[0] == value) {
            return true;
        }
    }

    return false;
}

class InputValidator {
    constructor() {}

    static checkDirectory(value) {
        logger.log(`InputValidator[checkDirectory]:start(${value})`);
        if (value == undefined) {
            logger.log('InputValidator[checkDirectory]: value is undefined');
            return 'The directory must be specified';
        }

        if (systemPlatform == 'win32') {
            logger.log('InputValidator[checkDirectory]: win32 systemPlatform');
            let isMatch = matchReg(value, /^[a-zA-Z]:(\\[^\\^\/^:^\*^\?^\"^<^>^|]+)*\\?/g);
            if (!isMatch) {
                return 'Please check the directory format, and make sure invalid characters \\\/:*?\"<>| are not included.';
            }
        }
        else {
            logger.log('InputValidator[checkDirectory]: notwin32 systemPlatform');
            let isMatch = matchReg(value, /^\/([^\/]+\/?)*/g);
            if (!isMatch) {
                return 'Please check the directory format.';
            }
        }

        return null;
    }

    static checkAppName(value) {
        logger.log(`InputValidator[checkAppName]:start(${value})`);
        if (value == undefined) {
            logger.log('InputValidator[checkAppName]: value is undefined');
            return 'The project name must be specified';
        }

        let isMatch = matchReg(value, '[a-zA-Z0-9]+');
        if (!isMatch) {
            return 'Use only alphabetic and numeric characters.';
        }

        return null;
    }

    static checkCertificateProfileName(value) {
        logger.log(`InputValidator[checkCertificateProfileName]:start(${value})`);
        if (value == undefined) {
            logger.log('InputValidator[checkCertificateProfileName]: value is undefined');
            return 'The profile name must be specified.';
        }

        let isMatch = matchReg(value, /[a-zA-Z-_0-9]+/);
        if (!isMatch) {
            return 'Use only alphabetic, numeric, \'-\', and \'_\' characters.';
        }

        let profileMgr = new ProfileManager(common.resourcePath);
        if (profileMgr.isProfileExist(value)) {
            logger.log('InputValidator[checkCertificateProfileName]: certificate profile already exists');
            return 'A certificate profile with the same name already exists.';
        }

        return null;
    }

    static checkCertificateFileName(value) {
        logger.log(`InputValidator[checkCertificateFileName]:start(${value})`);
        if (value == '') {
            logger.log('InputValidator[checkCertificateFileName]: value is null');
            return 'The key filename must be specified.';
        }

        let isMatch = matchReg(value, /[a-zA-Z-_0-9]+/);
        if (!isMatch) {
            return 'Use only alphabetic, numeric, \'-\', and \'_\' characters.';
        }

        return null;
    }

    static checkCertificateAuthorName(value) {
        logger.log(`InputValidator[checkCertificateAuthorName]:start(${value})`);
        if (value == '') {
            logger.log('InputValidator[checkCertificateAuthorName]: value is null');
            return 'The author name must be specified.';
        }

        let isMatch = matchReg(value, /[^\+^\\^#^,^<^>^;^"]+/);
        if (!isMatch) {
            return 'This field can not contain any of the following charaters: +\\#,<>;\"';
        }

        return null;
    }

    static checkIPAddress(value) {
        logger.log(`InputValidator[checkIPAddress]:start(${value})`);
        if (value == '') {
            logger.log('InputValidator[checkIPAddress]: value is null');
            return 'The IP address must be specified.'
        }

        let ipFrags = value.split('.');
        if (ipFrags.length != 4) {
            return 'Invalid IP address format.'
        }

        let incorrect = false;
        ipFrags.forEach(ip => {
            if (!matchReg(ip, /25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d/)) {
                incorrect = true;
            }
        })

        if (incorrect) {
            logger.log('InputValidator[checkIPAddress]: Invalid IP address format');
            return 'Invalid IP address format.'
        }

        return null;
    }

    static checkPackageId(value) {
        logger.log(`InputValidator[checkPackageId]:start(${value})`);
        if (value == '') {
            logger.log('InputValidator[checkPackageId]: value is null');
            return 'The Package ID must be specified.'
        }

        if (value.length != 10) {
            logger.log('InputValidator[checkPackageId]: Invalid Package ID format');
            return 'Invalid Package ID format'
        }

        return null;
    }
}
exports.InputValidator = InputValidator;