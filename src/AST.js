"use strict";


class Apply {
    constructor(expressions) {
        this.expressions = expressions;
    }

    toJSON() {
        return {
            type: 'APPLY',
            expressions: this.expressions
        };
    }
}


class ConstantInteger {
    constructor(value) {
        this.value = value;
    }

    toJSON() {
        return {
            type: 'CONSTANT_INTEGER',
            value: this.value
        };
    }
}

const newConstantInteger = v => new ConstantInteger(v);


class Declaration {
    constructor(name, expression) {
        this.name = name;
        this.expression = expression;
    }

    toJSON() {
        return {
            type: 'DECLARATION',
            name: this.name,
            expression: this.expression
        };
    }
}

const newDeclaration = (n, e) => new Declaration(n, e);


class Declarations {
    constructor(declarations) {
        this.declarations = declarations;
    }

    toJSON() {
        return {
            type: 'DECLARATIONS',
            declarations: this.declarations
        };
    }
}

const newDeclarations = ds => new Declarations(ds);


class Identifier {
    constructor(name) {
        this.name = name;
    }

    toJSON() {
        return {
            type: 'IDENTIFIER',
            name: this.name
        };
    }
}

const newIdentifier = n => new Identifier(n);


class Import {
    constructor(url, id) {
        this.type = 'IMPORT';
        this.url = url;
        this.id = id;
    }
}

class Lambda {
    constructor(variables, expression) {
        this.variables = variables;
        this.expression = expression;
    }

    toJSON() {
        return {
            type: 'LAMBDA',
            variables: this.variables,
            expression: this.expression
        };
    }
}

const newLambda = (v, e) => new Lambda(v, e);


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
    newConstantInteger,
    Declaration,
    newDeclaration,
    Declarations,
    newDeclarations,
    Identifier,
    newIdentifier,
    Import,
    newImport: (u, i) => new Import(u, i),
    Lambda,
    newLambda,
    Module,
    newModule: (i, d, e) => new Module(i, d, e)
};