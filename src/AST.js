"use strict";


class Addition {
    constructor(left, right) {
        this.type = 'ADDITION';
        this.left = left;
        this.right = right;
    }
}


class Apply {
    constructor(expressions) {
        this.type = 'APPLY';
        this.expressions = expressions;
    }
}


class BooleanAnd {
    constructor(expressions) {
        this.type = 'BOOLEAN_AND';
        this.expressions = expressions;
    }
}


class BooleanNot {
    constructor(operand) {
        this.type = 'BOOLEAN_NOT';
        this.operand = operand;
    }
}


class BooleanOr {
    constructor(expressions) {
        this.type = 'BOOLEAN_OR';
        this.expressions = expressions;
    }
}


class Composition {
    constructor(left, right) {
        this.type = 'COMPOSITION';
        this.left = left;
        this.right = right;
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


class Division {
    constructor(left, right) {
        this.type = 'DIVISION';
        this.left = left;
        this.right = right;
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

class InfixOperator {
    constructor(operator) {
        this.type = 'INFIX_OPERATOR';
        this.url = operator;
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


class Multiplication {
    constructor(left, right) {
        this.type = 'MULTIPLICATION';
        this.left = left;
        this.right = right;
    }
}


class NotEqual {
    constructor(left, right) {
        this.type = 'NOT_EQUAL';
        this.left = left;
        this.right = right;
    }
}


class StringConcat {
    constructor(left, right) {
        this.type = 'STRING_CONCAT';
        this.left = left;
        this.right = right;
    }
}


class Subtraction {
    constructor(left, right) {
        this.type = 'SUBTRACTION';
        this.left = left;
        this.right = right;
    }
}


class UnaryPlus {
    constructor(operand) {
        this.type = 'UNARY_PLUS';
        this.operand = operand;
    }
}


class UnaryNegate {
    constructor(operand) {
        this.type = 'UNARY_NEGATE';
        this.operand = operand;
    }
}


module.exports = {
    Addition,
    Apply,
    BooleanAnd,
    BooleanNot,
    BooleanOr,
    Composition,
    ConstantInteger,
    ConstantURL,
    Declaration,
    Division,
    Equal,
    Expressions,
    GreaterThan,
    GreaterThanEqual,
    Identifier,
    If,
    Import,
    InfixOperator,
    Lambda,
    LessThan,
    LessThanEqual,
    Module,
    Multiplication,
    NotEqual,
    StringConcat,
    Subtraction,
    UnaryPlus,
    UnaryNegate
};