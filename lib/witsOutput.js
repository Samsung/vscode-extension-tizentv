const vscode = require('vscode');
const { setOutputChannel } = require('@tizentv/wits');

let output = null;

const createOutput = () => {
    if (!output) {
        output = vscode.window.createOutputChannel('WITs output');
        setOutputChannel(delivery);
    }
};
const showOutput = () => {
    try {
        createOutput();
        output.show(true);
    } catch (erorr) {
        console.error(error);
    }
};

function delivery() {
    console.log(`delivery`);
    if (!output) return;
    const args = [].slice.call(arguments);
    output.appendLine(...args);
}

const hideOutput = () => {
    if (output === null) {
        return;
    }
    output.hide();
};

const clearOutput = () => {
    if (output == null) return;

    output.clear();
};
module.exports = {
    createOutput,
    showOutput,
    hideOutput,
    clearOutput
};
