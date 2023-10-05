/* eslint-disable no-bitwise */
const { join, resolve, parse } = require('path');
const { homedir, platform } = require('os');
const { promises, constants } = require('fs');

const { access, mkdir, cp } = promises;
const { window } = require('vscode');
const { logger } = require('./logger');

const { constants: sdburiConstants } = require('./sdburi/constants');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

function setOSRootDir() {
  if (platform === 'win32') {
    return parse(homedir()).root;
  }
  return homedir();
}

const extensionPath = resolve(__dirname, '..');
const profileTemplate = resolve(__dirname, '..', 'resource', 'profiles.xml');
const tizenStudioDataPath = join(
  setOSRootDir(),
  'tizen-studio-data',
  'vscode-tizentv'
);
const resourcePath = join(tizenStudioDataPath, 'resource');
const authorPath = join(resourcePath, 'Author');
const profilePath = join(resourcePath, 'profiles.xml');

async function runCommandInTerminal() {
  const terminal = window.createTerminal();
  terminal.show(true);
  terminal.sendText(
    `mkdir -p ${authorPath}; cp ${profileTemplate} ${resourcePath};`
  );
  window.showInformationMessage('Reload required');
}

async function createTizenStudioDataDir() {
  try {
    await mkdir(resourcePath);
    await cp(profileTemplate);
    logger.log(`succeed a making directory to ${tizenStudioDataPath}`);
  } catch (err) {
    const message = `Cannot mkdir the ${tizenStudioDataPath}. You should make the ${tizenStudioDataPath} directory.`;
    const buttons = ['Run Command in Terminal', 'Cancel'];
    const answer = await window.showErrorMessage(message, ...buttons);
    if (answer) {
      await runCommandInTerminal();
    } else {
      throw err;
    }
  }
}

async function checkTizenStudioDataDirectory() {
  try {
    await access(
      resourcePath,
      constants.F_OK | constants.R_OK | constants.W_OK
    );
    logger.log(`enable: ${resourcePath}`);
    await access(profilePath, constants.F_OK | constants.R_OK | constants.W_OK);
    logger.log(`enable: ${profilePath}`);
  } catch (err) {
    logger.error(err);
    await createTizenStudioDataDir();
  }
}

async function getConnectedDeviceList() {
  const sdbPath = await sdburiConstants.sdbPath.path;
  const { stdout } = await execAsync(`${sdbPath} devices`, {
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  const devices = stdout.replace(/\*.*\*/g, '');

  let devicesInfo = [];
  let deviceNameList = [];
  if (!devices.includes('offline')) {
    devicesInfo = devices.trim().split('\n');
    devicesInfo.shift();
    deviceNameList = parsingDeviceName(devicesInfo);
  }

  return deviceNameList;
}

function parsingDeviceName(devices) {
  const deviceNameList = [];
  devices.forEach(device => {
    deviceNameList.push(device.split('\t')[0].trim());
  });

  return deviceNameList;
}

module.exports = {
  extensionPath,
  resourcePath,
  profilePath,
  profileTemplate,
  authorPath,
  getConnectedDeviceList,
  checkTizenStudioDataDirectory
};
