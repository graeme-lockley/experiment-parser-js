"use strict";


class ConstantInteger {
    constructor(value) {
        this.value = value;
    }
}

const newConstantInteger = v => new ConstantInteger(v);


class Identifier {
    constructor(name) {
        this.name = name;
    }
}

const newIdentifier = n => new Identifier(n);


class Lambda {
    constructor(variables, expression) {
        this.variables = variables;
        this.expression = expression;
    }
}

const newLambda = (v, e) => new Lambda(v, e);


module.exports = {
    ConstantInteger,
    newConstantInteger,
    Identifier,
    newIdentifier,
    Lambda,
    newLambda
};