const platform = require('os').platform();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const forge = require('node-forge');

const { logger } = require('./logger');

const cryptToolExec =
    platform == 'win32'
        ? 'wincrypt.exe'
        : platform == 'linux'
        ? 'secret-tool'
        : 'security';
const cryptTool = path.resolve(
    __dirname,
    '..',
    'tools',
    'certificate-encryptor',
    `${cryptToolExec}`
);

function encryptPassword(password, pwdFile) {
    logger.log(`cryptUtil[encryptPassword]: start`);
    if (platform == 'win32') {
        logger.log('cryptUtil[encryptPassword]: win32 platform');
        try {
            execSync(`${cryptTool} --encrypt "${password}" ${pwdFile}`);
        } catch (err) {
            if (err.stderr && err.stderr.toString()) {
                logger.error('crypt util[encryptPassword]: ${err.stderr.toString()}');
            }
        }
    } else if (platform == 'linux') {
        logger.log('cryptUtil[encryptPassword]: linux platform');
        execSync(
            `${cryptTool} store --label="tizen-studio" -p "${password}" keyfile ${pwdFile} tool certificate-manager`
        );
    } else if (platform == 'darwin') {
        logger.log('cryptUtil[encryptPassword]: darwin platform');
        execSync(
            `security add-generic-password -a ${pwdFile} -s certificate-manager -w "${password}" -U`
        );
    }
}

function decryptPassword(pwdFile) {
    logger.log('cryptUtil[decryptPassword]:start');
    let password = '';
    if (platform == 'win32') {
        logger.log('cryptUtil[decryptPassword]: win32 platform');
        try {
            let out = execSync(`${cryptTool} --decrypt ${pwdFile}`);
            if (out.includes('PASSWORD:')) {
                out.trim();
                password = out.substring(9).replace(/[\r\n]/g, '');
            }
        } catch (err) {
            let stderr = err.stderr.toString();
            let stdout = err.stdout.toString();

            if (stderr) {
                logger.log('cryptUtil[decryptPassword]: ${stderr}');
            } else if (stdout.includes('PASSWORD:')) {
                stdout.trim();
                password = stdout.substring(9).replace(/[\r\n]/g, '');
            }
        }
    } else if (platform == 'linux') {
        logger.log('cryptUtil[decryptPassword]: linux platform');
        let out = execSync(
            `${cryptTool} lookup --label="tizen-studio" keyfile ${pwdFile} tool certificate-manager`
        );
        out = out.toString();
        if (out) {
            logger.log(`cryptUtil[decryptPassword]: out: ${out}, length: ${out.length}`);
            out.trim();
            password = out.replace(/[\r\n]/g, '');
        }
    } else if (platform == 'darwin') {
        logger.log('cryptUtil[decryptPassword]: darwin platform');
        let out = execSync(
            `security find-generic-password -wa ${pwdFile} -s certificate-manager`
        );
        out = out.toString();
        if (out) {
            logger.log(`cryptUtil[decryptPassword]: out: ${out}, length: ${out.length}`);
            out.trim();
            password = out.replace(/[\r\n]/g, '');
        }
    }

    return password;
}

function checkP12Password(file, password) {
    logger.log('cryptUtil[checkP12Password]:start');
    try {
        let p12Der = fs.readFileSync(file).toString('binary');
        let p12Asn1 = forge.asn1.fromDer(p12Der);
        forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
    } catch (err) {
        logger.error("cryptUtil[checkP12Password]: ${err.message}");
        return false;
    }

    return true;
}

function parseP12File(p12File, password) {
    logger.log("cryptUtil[parseP12File]:start");
    let p12Content = {
        privateKey: '',
        certChain: []
    };
    try {
        let p12Der = fs.readFileSync(p12File).toString('binary');
        let p12Asn1 = forge.asn1.fromDer(p12Der);
        let p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

        p12.safeContents.forEach(safeContent => {
            safeContent.safeBags.forEach(safeBag => {
                if (safeBag.type == forge.pki.oids.certBag) {
                    let certBegin = '-----BEGIN CERTIFICATE-----';
                    let certEnd = '-----END CERTIFICATE-----';
                    let cert = forge.pki.certificateToPem(safeBag.cert);
                    let from = cert.indexOf(certBegin) + certBegin.length + 1;
                    let to = cert.indexOf(certEnd);
                    p12Content.certChain.push(cert.substring(from, to));
                } else if (safeBag.type == forge.pki.oids.pkcs8ShroudedKeyBag) {
                    let keyBegin = '-----BEGIN RSA PRIVATE KEY-----';
                    let key = forge.pki.privateKeyToPem(safeBag.key);
                    let from = key.indexOf(keyBegin);
                    p12Content.privateKey = key.substring(from);
                }
            });
        });
    } catch (err) {
        logger.error("cryptUtil[parseP12File]: ${err.message}");
        throw err;
    }

    return p12Content;
}

module.exports = {
    encryptPassword,
    decryptPassword,
    checkP12Password,
    parseP12File
};
