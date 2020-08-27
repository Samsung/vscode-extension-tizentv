const path = require('path');

const extensionPath = path.resolve(__dirname, '..');
const resourcePath = path.resolve(__dirname, '..', 'resource');
const profilePath = path.resolve(resourcePath, 'profiles.xml');
const authorPath = extensionPath + '/resource/Author'.split('/').join(path.sep);


module.exports = {
    extensionPath,
    resourcePath,
    profilePath,
    authorPath
}