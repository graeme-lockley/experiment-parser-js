"use strict";


function addition(left) {
    return right => {
        return {
            type: 'ADDITION',
            left: left,
            right: right
        };
    }
}


function apply(expressions) {
    return {
        type: 'APPLY',
        expressions: expressions
    };
}


function assumption(sourceName) {
    return line => text => expression => {
        return {
            type: 'ASSUMPTION',
            sourceName: sourceName,
            line: line,
            text: text,
            expression: expression
        };
    }
}


function booleanAnd(expressions) {
    return {
        type: 'BOOLEAN_AND',
        expressions: expressions
    };
}


function booleanNot(operand) {
    return {
        type: 'BOOLEAN_NOT',
        operand: operand
    };
}


function booleanOr(expressions) {
    return {
        type: 'BOOLEAN_OR',
        expressions: expressions
    };
}


function composition(left) {
    return right => {
        return {
            type: 'COMPOSITION',
            left: left,
            right: right
        };
    };
}


function constantBoolean(value) {
    return {
        type: 'CONSTANT_BOOLEAN',
        value: value
    };
}


function constantCharacter(value) {
    return {
        type: 'CONSTANT_CHARACTER',
        value: value
    };
}


function constantInteger(value) {
    return {
        type: 'CONSTANT_INTEGER',
        value: value
    };
}


function constantString(value) {
    return {
        type: 'CONSTANT_STRING',
        value: value
    };
}


function constantUnit() {
    return {
        type: 'CONSTANT_UNIT'
    };
}


function constantURL(value) {
    return {
        type: 'CONSTANT_URL',
        value: value
    };
}


function declaration(name) {
    return expression=> assumptions=> {
        return {
            type: 'DECLARATION',
            name: name,
            expression: expression,
            assumptions: assumptions
        };
    };
}


function division(left) {
    return right => {
        return {
            type: 'DIVISION',
            left: left,
            right: right
        };
    };
}


function equal(left) {
    return right => {
        return {
            type: 'EQUAL',
            left: left,
            right: right
        };
    };
}


function expressions(expressions) {
    return {
        type: 'EXPRESSIONS',
        expressions: expressions,
    };
}


function greaterThan(left) {
    return right => {
        return {
            type: 'GREATER_THAN',
            left: left,
            right: right
        };
    };
}


function greaterThanEqual(left) {
    return right => {
        return {
            type: 'GREATER_THAN_EQUAL',
            left: left,
            right: right
        };
    };
}


function identifier(name) {
    return {
        type: 'IDENTIFIER',
        name: name
    };
}


function ifte(ifExpr) {
    return thenExpr=> elseExpr => {
        return {
            type: 'IF',
            ifExpr: ifExpr,
            thenExpr: thenExpr,
            elseExpr: elseExpr
        };
    };
}


function importModule(url) {
    return id => {
        return {
            type: 'IMPORT',
            url: url,
            id: id
        };
    };
}

function infixOperator(operator) {
    return {
        type: 'INFIX_OPERATOR',
        operator: operator
    };
}

function lambda(variables) {
    return expression => {
        return {
            type: 'LAMBDA',
            variables: variables,
            expression: expression
        };
    };
}


function lessThan(left) {
    return right => {
        return {
            type: 'LESS_THAN',
            left: left,
            right: right
        };
    };
}


function lessThanEqual(left) {
    return right => {
        return {
            type: 'LESS_THAN_EQUAL',
            left: left,
            right: right
        };
    };
}


function moduleDeclaration(sourceName) {
    return imports => declarations => optionalExpression => {
        return {
            type: 'MODULE',
            sourceName: sourceName,
            imports: imports,
            declarations: declarations,
            optionalExpression: optionalExpression
        };
    };
}


function multiplication(left) {
    return right => {
        return {
            type: 'MULTIPLICATION',
            left: left,
            right: right
        };
    };
}


function notEqual(left) {
    return right => {
        return {
            type: 'NOT_EQUAL',
            left: left,
            right: right
        };
    };
}


function qualifiedIdentifier(module) {
    return identifier => {
        return {
            type: "QUALIFIED_IDENTIFIER",
            module: module,
            identifier: identifier
        };
    };
}


function stringConcat(left) {
    return right => {
        return {
            type: 'STRING_CONCAT',
            left: left,
            right: right
        };
    };
}


function subtraction(left) {
    return right => {
        return {
            type: 'SUBTRACTION',
            left: left,
            right: right
        };
    };
}


function unaryPlus(operand) {
    return {
        type: 'UNARY_PLUS',
        operand: operand
    };
}


function unaryNegate(operand) {
    return {
        type: 'UNARY_NEGATE',
        operand: operand
    };
}


module.exports = {
    addition,
    apply,
    assumption,
    booleanAnd,
    booleanNot,
    booleanOr,
    composition,
    constantBoolean,
    constantCharacter,
    constantInteger,
    constantString,
    constantUnit,
    constantURL,
    declaration,
    division,
    equal,
    expressions,
    greaterThan,
    greaterThanEqual,
    identifier,
    ifte,
    importModule,
    infixOperator,
    lambda,
    lessThan,
    lessThanEqual,
    moduleDeclaration,
    multiplication,
    notEqual,
    qualifiedIdentifier,
    stringConcat,
    subtraction,
    unaryPlus,
    unaryNegate
};