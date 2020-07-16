const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const cryptUtil = require('./cryptUtil');
const profileEditor = require('./profileEditor');

const extensionPath = path.resolve(__dirname, '..');
const certPath = path.resolve(extensionPath, 'tools', 'certificate-generator', 'certificates');
const caPriKeyPath = path.resolve(certPath, 'developer', 'tizen-developer-ca-privatekey.pem');
const caCertPath = path.resolve(certPath, 'developer', 'tizen-developer-ca.cer');
const distributorPublicSigner = path.resolve(certPath, 'distributor', 'tizen-distributor-signer.p12');
const distributorPartnerSigner = path.resolve(certPath, 'distributor', 'sdk-partner','tizen-distributor-signer.p12');
const distributorSignerPassword = 'tizenpkcs12passfordsigner';
const authorPath = extensionPath + '/resource/Author'.split('/').join(path.sep);

function makeFilePath(pathName) {
    if (fs.existsSync(pathName)) {
        return true;
    }
    else {
        if (makeFilePath(path.dirname(pathName))) {
            fs.mkdirSync(pathName);
            return true;
        }
    }
}

function loadCaCert() {
    let caContent = fs.readFileSync(caCertPath, {encoding: 'utf8'});

    let strBeginCertificate = '-----BEGIN CERTIFICATE-----';
    let strEndCertificate = '-----END CERTIFICATE-----';
    
    let line1Beg  = caContent.indexOf(strBeginCertificate);
    let line1End  = caContent.indexOf(strEndCertificate);

    let strBeginLen = strBeginCertificate.length;
    let strEndLen = strEndCertificate.length;
    
    let cert1 = caContent.substring(line1Beg, line1End+strEndLen);
    return cert1;
}

function registerProfile(profileName, keyfileName, password, privilege) {
    let authorPwdFile = path.resolve(path.dirname(keyfileName), path.basename(keyfileName, '.p12') + '.pwd');
    let distributorKey = privilege == 'public' ? distributorPublicSigner : distributorPartnerSigner;
    let distributorPwdFile = path.resolve(path.dirname(distributorKey), path.basename(distributorKey, '.p12') + '.pwd');

    cryptUtil.encryptPassword(password, authorPwdFile);
    if (!fs.existsSync(distributorPwdFile)) {
        cryptUtil.encryptPassword(distributorSignerPassword, distributorPwdFile);
    }

    profileEditor.createProfile(profileName, {
        key: keyfileName,
        password: authorPwdFile
    }, {
        key: distributorKey,
        password: distributorPwdFile
    }, undefined, true);
}

function createCert(profileName, keyfileName, authorName, authorPassword, privilege){
    // generate a keypair
    let keys = forge.pki.rsa.generateKeyPair(1024);

    // create a certificate
    let cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();

    let notAfterDate = new Date();
    notAfterDate.setFullYear(cert.validity.notBefore.getFullYear() + 8);
    cert.validity.notAfter = notAfterDate;

    let attrs = [{
        name: 'commonName',
        value: authorName
    }];

    let issurInfo = [{
        name: 'organizationName',
        value: 'Tizen Association'
    }, {
        shortName: 'OU',
        value: 'Tizen Association'
    }, {
        shortName: 'CN',
        value: 'Tizen Developers CA'
    }];
    cert.setSubject(attrs);
    cert.setIssuer(issurInfo);
    
    cert.setExtensions([{
        name: 'basicConstraints',
        cA: true
    }, {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
    }, {
        name: 'extKeyUsage',
        codeSigning: true
    }]);

    let caPriPem = fs.readFileSync(caPriKeyPath, {encoding: 'utf8'});
    let caPassword = 'tizencertificatefordevelopercaroqkfwk';
    let decryptedCaPriKey = forge.pki.decryptRsaPrivateKey(caPriPem, caPassword);
    cert.sign(decryptedCaPriKey);

    let userCert =  forge.pki.certificateToPem(cert);
    let caCert = loadCaCert();
    let certArray = [userCert, caCert];

    // create PKCS12
    let newPkcs12Asn1 = forge.pkcs12.toPkcs12Asn1(
        keys.privateKey, certArray, authorPassword,
        {generateLocalKeyId: true, friendlyName: authorName});

    let newPkcs12Der = forge.asn1.toDer(newPkcs12Asn1).getBytes();

    if (!fs.existsSync(authorPath)) {
        makeFilePath(authorPath);
    }

    let keyFilePath = authorPath + path.sep + keyfileName + '.p12';
    fs.writeFileSync(keyFilePath, newPkcs12Der, {encoding: 'binary'});

    registerProfile(profileName, keyFilePath, authorPassword, privilege);
}
exports.createCert = createCert;
 
