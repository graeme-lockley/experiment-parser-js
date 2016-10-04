"use strict";


class Apply {
    constructor(expressions) {
        this.type = 'APPLY';
        this.expressions = expressions;
    }
}


class BooleanAnd{
    constructor(expressions) {
        this.type = 'BOOLEAN_AND';
        this.expressions = expressions;
    }
}


class BooleanOr{
    constructor(expressions) {
        this.type = 'BOOLEAN_OR';
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


class Equal {
    constructor(left, right) {
        this.type = 'EQUAL';
        this.left = left;
        this.right = right;
    }
}


class Expressions {
    constructor(expressions) {
        this.type = 'EXPRESSIONS';
        this.expressions = expressions;
    }
}


class GreaterThan {
    constructor(left, right) {
        this.type = 'GREATER_THAN';
        this.left = left;
        this.right = right;
    }
}


class GreaterThanEqual {
    constructor(left, right) {
        this.type = 'GREATER_THAN_EQUAL';
        this.left = left;
        this.right = right;
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


class LessThan {
    constructor(left, right) {
        this.type = 'LESS_THAN';
        this.left = left;
        this.right = right;
    }
}


class LessThanEqual {
    constructor(left, right) {
        this.type = 'LESS_THAN_EQUAL';
        this.left = left;
        this.right = right;
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


class NotEqual {
    constructor(left, right) {
        this.type = 'NOT_EQUAL';
        this.left = left;
        this.right = right;
    }
}


module.exports = {
    Apply,
    BooleanAnd,
    BooleanOr,
    ConstantInteger,
    ConstantURL,
    Declaration,
    Equal,
    Expressions,
    GreaterThan,
    GreaterThanEqual,
    Identifier,
    If,
    Import,
    Lambda,
    LessThan,
    LessThanEqual,
    Module,
    NotEqual
};