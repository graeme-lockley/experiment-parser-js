"use strict";

const AST = require('./AST');
const Array = require('../core/Array');


const infixOperators = {
    '||': '(_$a => (_$b => (_$a || _$b)))',
    '&&': '(_$a => (_$b => (_$a && _$b)))',
    '==': '(_$a => (_$b => (_$a == _$b)))',
    '!=': '(_$a => (_$b => (_$a != _$b)))',
    '<': '(_$a => (_$b => (_$a < _$b)))',
    '<=': '(_$a => (_$b => (_$a <= _$b)))',
    '>': '(_$a => (_$b => (_$a > _$b)))',
    '>=': '(_$a => (_$b => (_$a >= _$b)))',
    '++': '(_$a => (_$b => (_$a + _$b)))',
    '+': '(_$a => (_$b => (_$a + _$b)))',
    '-': '(_$a => (_$b => (_$a - _$b)))',
    '*': '(_$a => (_$b => (_$a * _$b)))',
    '/': '(_$a => (_$b => (_$a / _$b)))'
};


function encodeString(s) {
    return s
        .replace('\n', '\\n')
        .replace('"', '\\"');
}


function astToJavascript(ast, indentation = 0) {
    function spaces(count) {
        return '  '.repeat(count);
    }

    if (ast.type == "ADDITION") {
        return '(' + astToJavascript(ast.left, indentation) + " + " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "APPLY") {
        return astToJavascript(ast.expressions[0], indentation) + ast.expressions.slice(1).map(x => "(" + astToJavascript(x, indentation) + ")").join('');
    } else if (ast.type == "BOOLEAN_AND") {
        return '(' + ast.expressions.map(e => astToJavascript(e, indentation)).join(' && ') + ')';
    } else if (ast.type == "BOOLEAN_NOT") {
        return '(!' + astToJavascript(ast.operand, indentation) + ')';
    } else if (ast.type == "BOOLEAN_OR") {
        return '(' + ast.expressions.map(e => astToJavascript(e, indentation)).join(' || ') + ')';
    } else if (ast.type == "COMPOSITION") {
        const variableName = '_$' + indentation;
        return '(' + variableName + ' => ' + astToJavascript(ast.left, indentation) + '(' + astToJavascript(ast.right, indentation) + '(' + variableName + ')))';
    } else if (ast.type == "CONSTANT_BOOLEAN") {
        return ast.value ? 'true' : 'false';
    } else if (ast.type == "CONSTANT_CHARACTER") {
        return '"' + encodeString(ast.value) + '"';
    } else if (ast.type == "CONSTANT_INTEGER") {
        return ast.value;
    } else if (ast.type == "CONSTANT_STRING") {
        return '"' + encodeString(ast.value) + '"';
    } else if (ast.type == "CONSTANT_UNIT") {
        return 'undefined';
    } else if (ast.type == "DECLARATION") {
        if (ast.expression.type == "LAMBDA") {
            return spaces() + 'function ' + ast.name + '(' + ast.expression.variables[0] + ') {\n' + (ast.expression.variables.length == 1 ? '  return ' + astToJavascript(ast.expression.expression, indentation + 1) + ';\n' : '  return ' + astToJavascript(AST.lambda(ast.expression.variables.slice(1))(ast.expression.expression), indentation + 1) + ';\n') + '}';
        } else {
            return spaces() + 'const ' + ast.name + ' = ' + astToJavascript(ast.expression) + ';';
        }
    } else if (ast.type == "DIVISION") {
        return '(' + astToJavascript(ast.left, indentation) + ' / ' + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "EQUAL") {
        return '(' + astToJavascript(ast.left, indentation) + " == " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "EXPRESSIONS") {
        return '(() => {\n' + spaces(indentation + 2)
            + ast.expressions.slice(0, ast.expressions.length - 1).map(e => astToJavascript(e, indentation + 2)).join(";\n" + spaces(indentation + 2))
            + (ast.expressions.length > 1 ? ';\n' : '')
            + spaces(indentation + 2) + 'return ' + astToJavascript(ast.expressions[ast.expressions.length - 1]) + ';\n'
            + spaces(indentation + 1) + "})()";
    } else if (ast.type == "GREATER_THAN") {
        return '(' + astToJavascript(ast.left, indentation) + " > " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "GREATER_THAN_EQUAL") {
        return '(' + astToJavascript(ast.left, indentation) + " >= " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "IDENTIFIER") {
        return ast.name;
    } else if (ast.type == "IF") {
        return '(' + astToJavascript(ast.ifExpr, indentation) + "\n" + spaces(indentation + 1) + "? " + astToJavascript(ast.thenExpr, indentation + 1) + "\n" + spaces(indentation + 1) + ": " + astToJavascript(ast.elseExpr, indentation + 1) + ')';
    } else if (ast.type == "IMPORT") {
        const fileName = ast.url.value.substring(5);

        return 'const ' + ast.id.name + " = require('" + (fileName.startsWith('./') || fileName.startsWith('/') ? fileName : './' + fileName) + "');";
    } else if (ast.type == "INFIX_OPERATOR") {
        return infixOperators[ast.operator];
    } else if (ast.type == "LAMBDA") {
        const tmpResult = '(' + Array.foldr(accumulator => item => "(" + item + " => " + accumulator + ")")(astToJavascript(ast.expression, indentation))(ast.variables) + ')';
        return tmpResult.substr(1, tmpResult.length - 2);
    } else if (ast.type == "LESS_THAN") {
        return '(' + astToJavascript(ast.left, indentation) + " < " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "LESS_THAN_EQUAL") {
        return '(' + astToJavascript(ast.left, indentation) + " <= " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "MODULE") {
        const imports = ast.imports.map(i => astToJavascript(i, indentation)).join('\n');

        const suffix = ast.declarations.length == 0 && !ast.optionalExpression.isJust() ? '\nmodule.exports = {\n' + spaces(1) + '_$ASSUMPTIONS\n};' :
            ast.declarations.length > 0 && !ast.optionalExpression.isJust() ? '\nmodule.exports = {\n' + ast.declarations.map(d => spaces(1) + d.name).join(',\n') + ',\n' + spaces(1) + '_$ASSUMPTIONS\n};' :
                ast.declarations.length > 0 && ast.optionalExpression.isJust() ? '\nmodule.exports = {\n' + ast.declarations.map(d => spaces(1) + d.name).join(',\n') + ',\n' + spaces(1) + '_$EXPR,\n' + spaces(1) + '_$ASSUMPTIONS\n};' :
                '\nmodule.exports = {\n' + spaces(1) + '_$EXPR,\n' + spaces(1) + '_$ASSUMPTIONS\n};';

        return (imports.length == 0 ? '' : imports + '\n\n')
            + ast.declarations.map(d => astToJavascript(d, indentation)).join('\n\n')
            + (ast.optionalExpression.isJust() ? '\n\nconst _$EXPR = ' + astToJavascript(ast.optionalExpression.withDefault(), indentation) + ';' : '')
            + '\n\nconst _$ASSUMPTIONS = [].concat(\n'
            + ast.imports.map(i => '  ' + i.id.name + '._$ASSUMPTIONS || []').join(',\n') + ');\n\n'
            + '_$ASSUMPTIONS.push({\n'
            + '  source: \'' + simplifyPath(encodeString(ast.sourceName)) + '\',\n'
            + '  declarations: [\n'
            + ast.declarations.filter(d => d.assumptions.length > 0).map(d => '    {\n'
            + '      name: \'' + d.name + '\',\n'
            + '      predicates: [\n'
            + d.assumptions.map(a =>
            '        {\n'
            + '          line: ' + a.line + ',\n'
            + '          source: \'' + simplifyPath(encodeString(a.sourceName)) + '\',\n'
            + '          text: \'' + encodeString(a.text) + '\',\n'
            + '          predicate: () => ' + astToJavascript(a.expression, 6) + '\n'
            + '        }').join(',\n') + '\n'
            + '      ]\n'
            + '    }').join(',\n') + '\n'
            + '  ]\n'
            + '});\n\n'
            + suffix;
    } else if (ast.type == "MULTIPLICATION") {
        return '(' + astToJavascript(ast.left, indentation) + " * " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "QUALIFIED_IDENTIFIER") {
        return ast.module + "." + ast.identifier;
    } else if (ast.type == "STRING_CONCAT") {
        return '(' + astToJavascript(ast.left, indentation) + " + " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "SUBTRACTION") {
        return '(' + astToJavascript(ast.left, indentation) + " - " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast.type == "UNARY_PLUS") {
        return '(+' + astToJavascript(ast.operand) + ')';
    } else if (ast.type == "UNARY_NEGATE") {
        return '(-' + astToJavascript(ast.operand) + ')';
    }
}


function simplifyPath(path) {
    let candidateResult = path;
    while (true) {
        const result = candidateResult.replace('/./', '/');
        if (result == candidateResult) {
            return result;
        } else {
            candidateResult = result;
        }
    }
}


module.exports = {
    astToJavascript
};