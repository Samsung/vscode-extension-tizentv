const outputChannel = [];

const setOutputChannel = output => {
    if (typeof output !== 'function') {
        throw new Error(`output should be function`);
    }
    console.log(`setOutputChannel `);
    outputChannel.push(output);
    console.log(`length ${outputChannel.length}`);
};

function error() {
    var args = [].slice.call(arguments);
    [console.error, ...outputChannel].forEach(print => {
        print(...args);
    });
}

function warn() {
    var args = [].slice.call(arguments);
    [console.warn, ...outputChannel].forEach(print => {
        print(...args);
    });
}

function log() {
    var args = [].slice.call(arguments);
    console.log(arguments);
    console.log(`length ${outputChannel.length}`);
    [console.log, ...outputChannel].forEach(print => {
        print(...args);
    });
}

function debug() {
    var args = [].slice.call(arguments);
    console.debug(...args);
}

const logger = {
    error,
    warn,
    log,
    debug
};

// window.logger = logger;

module.exports = {
    setOutputChannel,
    logger
};
