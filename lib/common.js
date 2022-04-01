/* eslint-disable no-bitwise */
const { join, resolve, parse } = require('path');
const { homedir, platform } = require('os');
const {
  promises, constants,
} = require('fs');

const {
  access, mkdir, cp,
} = promises;
const { window } = require('vscode');
const { logger } = require('./logger');

function setOSRootDir() {
  if (platform === 'win32') {
    return parse(homedir()).root;
  }
  return homedir();
}

const extensionPath = resolve(__dirname, '..');
const profileTemplate = resolve(__dirname, '..', 'resource', 'profiles.xml');
const tizenStudioDataPath = join(setOSRootDir(), 'tizen-studio-data', 'vscode-tizentv');
const resourcePath = join(tizenStudioDataPath, 'resource');
const authorPath = join(resourcePath, 'Author');
const profilePath = join(resourcePath, 'profiles.xml');

async function runCommandInTerminal() {
  const terminal = window.createTerminal();
  terminal.show(true);
  terminal.sendText(`mkdir -p ${authorPath}; cp ${profileTemplate} ${resourcePath};`);
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
    await access(resourcePath, constants.F_OK | constants.R_OK | constants.W_OK);
    logger.log(`enable: ${resourcePath}`);
    await access(profilePath, constants.F_OK | constants.R_OK | constants.W_OK);
    logger.log(`enable: ${profilePath}`);
  } catch (err) {
    logger.error(err);
    await createTizenStudioDataDir();
  }
}

module.exports = {
  extensionPath,
  resourcePath,
  profilePath,
  profileTemplate,
  authorPath,
  checkTizenStudioDataDirectory,
};
