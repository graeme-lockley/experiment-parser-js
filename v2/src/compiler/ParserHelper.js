"use strict";

const AST = require('./AST');

function parseDECLMap(elements) {
    const assumptions = elements[3].withDefault([]);
    return elements[0].length == 1 ? AST.declaration(elements[0][0].name)(elements[2])(assumptions) : AST.declaration(elements[0][0].name)(AST.lambda(elements[0].slice(1).map(n => n.name))(elements[2]))(assumptions)
}


function parseDECLAssumptionMap(lexer) {
    return es => es[2].map(a => {
        const startIndexXY = a[0].indexXY;
        const endIndexXY = a[1].indexXY;
        const text = (lexer.streamText(startIndexXY)(endIndexXY)).trim();
        return AST.assumption(lexer.sourceName)(a[0].y)(text)(a[2]);
    });
}


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
    parseDECLMap,
    parseDECLAssumptionMap,
    convertString,
};