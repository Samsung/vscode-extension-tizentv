const vscode = require('vscode');
const { setOutputChannel } = require('./logger');
let output = null;

const createOutput = () => {
    console.log('the createOutput is invoked');
    if (!output) {
        console.log('Create output channel');
        output = vscode.window.createOutputChannel('Tizen TV');
        setOutputChannel(delivery);
    }
};

function delivery() {
    console.log('delivery');
    console.log(output);
    if (!output) return;
    const args = [].slice.call(arguments);
    console.log('extension output before');
    output.appendLine(...args);
}

const showOutput = () => {
    try {
        createOutput();
        output.show(true);
    } catch (erorr) {
        console.error(error);
    }
};

const hideOutput = () => {
    if (output === null) {
        return;
    }
    output.hide();
};

module.exports = {
    createOutput,
    showOutput,
    hideOutput
};
