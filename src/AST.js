"use strict";


class Apply {
    constructor(expressions) {
        this.expressions = expressions;
    }
}

const newApply = e => new Apply(e);


class ConstantInteger {
    constructor(value) {
        this.value = value;
    }
}

const newConstantInteger = v => new ConstantInteger(v);


class Declaration {
    constructor(name, expression) {
        this.name = name;
        this.expression = expression;
    }
}

const newDeclaration = (n, e) => new Declaration(n, e);


class Declarations {
    constructor(declarations) {
        this.declarations = declarations;
    }
}

const newDeclarations = ds => new Declarations(ds);


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
    Apply,
    newApply: e => new Apply(e),
    ConstantInteger,
    newConstantInteger,
    Declaration,
    newDeclaration,
    Declarations,
    newDeclarations,
    Identifier,
    newIdentifier,
    Lambda,
    newLambda
};