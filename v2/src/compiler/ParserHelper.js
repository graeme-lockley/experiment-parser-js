"use strict";

const AST = require('./AST');

function convertCharacter(c) {
    if (c == '\\n') {
        return '\n';
    } else if (c.length == 2) {
        return c[1];
    } else {
        return c;
    }
}


function convertString(s) {
    let result = s;
    let index = 0;
    while (true) {
        if (index >= result.length) {
            return result;
        } else if (result[index] == '\\') {
            result = result.slice(0, index) + convertCharacter(result.slice(index, index + 2)) + result.slice(index + 2);
        }

        index += 1;
    }
}

module.exports = {
    convertString,
};