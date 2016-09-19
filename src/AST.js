"use strict";

var ASTEnum = {
    CONSTANT_INTEGER: 1,
    IDENTIFIER: 2,
    LAMBDA: 3
};

function CONSTANT_INTEGER(value) {
    return {
        type: ASTEnum.CONSTANT_INTEGER,
        value: value
    };
}

function IDENTIFIER(name) {
    return {
        type: ASTEnum.IDENTIFIER,
        name: name
    };
}

function LAMBDA(variables, expression) {
    return {
        type: ASTEnum.LAMBDA,
        variables: variables,
        expression: expression
    };
}

module.exports = {
    ASTEnum: ASTEnum,
    CONSTANT_INTEGER: CONSTANT_INTEGER,
    IDENTIFIER: IDENTIFIER,
    LAMBDA: LAMBDA
};