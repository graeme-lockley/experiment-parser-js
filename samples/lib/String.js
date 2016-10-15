const Array = require('./Array');

function split(regex) {
    return s => Array.toList(s.split(regex));
}

module.exports = {
    split
};