const vscode = require('vscode');
const wits = require('@tizentv/wits');
const logger = require('./logger');

const generateOutputCommand = (name, registerCallback) => {
    let output = vscode.window.createOutputChannel(name);
    function delivery() {
        if (!output) return;
        const args = [].slice.call(arguments);
        output.appendLine(...args);
    }

    registerCallback(delivery);

    return output;
};

let witsOutput;
const getWitsOutputCommand = () => {
    if (!witsOutput) {
        witsOutput = generateOutputCommand('WITs', wits.setOutputChannel);
    }

    return witsOutput;
};

let tizenTvOutput;
const getTizenTvOutputCommand = () => {
    if (!tizenTvOutput) {
        tizenTvOutput = generateOutputCommand(
            'TizenTV',
            logger.setOutputChannel
        );
    }
    return tizenTvOutput;
};

module.exports = { getWitsOutputCommand, getTizenTvOutputCommand };
