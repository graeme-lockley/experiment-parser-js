"use strict";


class Apply {
    constructor(expressions) {
        this.type = 'APPLY';
        this.expressions = expressions;
    }
}


class ConstantInteger {
    constructor(value) {
        this.type = 'CONSTANT_INTEGER';
        this.value = value;
    }
}


class ConstantURL {
    constructor(value) {
        this.type = 'CONSTANT_URL';
        this.value = value;
    }
}


class Declaration {
    constructor(name, expression) {
        this.type = 'DECLARATION';
        this.name = name;
        this.expression = expression;
    }
}


class Identifier {
    constructor(name) {
        this.type = 'IDENTIFIER';
        this.name = name;
    }
}


class If {
    constructor(ifExpr, thenExpr, elseExpr) {
        this.type = 'IF';
        this.ifExpr = ifExpr;
        this.thenExpr = thenExpr;
        this.elseExpr = elseExpr;
    }
}


class Import {
    constructor(url, id) {
        this.type = 'IMPORT';
        this.url = url;
        this.id = id;
    }
}

class Lambda {
    constructor(variables, expression) {
        this.type = 'LAMBDA';
        this.variables = variables;
        this.expression = expression;
    }
}


class Module {
    constructor(imports, declarations, optionalExpression) {
        this.type = 'MODULE';
        this.imports = imports;
        this.declarations = declarations;
        this.optionalExpression = optionalExpression;
    }
}


module.exports = {
    Apply,
    newApply: e => new Apply(e),
    ConstantInteger,
    newConstantInteger: v => new ConstantInteger(v),
    ConstantURL,
    newConstantURL: v => new ConstantURL(v),
    Declaration,
    newDeclaration: (n, e) => new Declaration(n, e),
    Identifier,
    newIdentifier: n => new Identifier(n),
    If,
    newIf: (i, t, e) => new If(i, t, e),
    Import,
    newImport: (u, i) => new Import(u, i),
    Lambda,
    newLambda: (v, e) => new Lambda(v, e),
    Module,
    newModule: (i, d, e) => new Module(i, d, e)
};