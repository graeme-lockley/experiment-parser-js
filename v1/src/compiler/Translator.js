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

    if (ast instanceof AST.Addition) {
        return '(' + astToJavascript(ast.left, indentation) + " + " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.Apply) {
        return astToJavascript(ast.expressions[0], indentation) + ast.expressions.slice(1).map(x => "(" + astToJavascript(x, indentation) + ")").join('');
    } else if (ast instanceof AST.BooleanAnd) {
        return '(' + ast.expressions.map(e => astToJavascript(e, indentation)).join(' && ') + ')';
    } else if (ast instanceof AST.BooleanNot) {
        return '(!' + astToJavascript(ast.operand, indentation) + ')';
    } else if (ast instanceof AST.BooleanOr) {
        return '(' + ast.expressions.map(e => astToJavascript(e, indentation)).join(' || ') + ')';
    } else if (ast instanceof AST.Composition) {
        const variableName = '_$' + indentation;
        return '(' + variableName + ' => ' + astToJavascript(ast.left, indentation) + '(' + astToJavascript(ast.right, indentation) + '(' + variableName + ')))';
    } else if (ast instanceof AST.ConstantBoolean) {
        return ast.value ? 'true' : 'false';
    } else if (ast instanceof AST.ConstantCharacter) {
        return '"' + ast.value + '"';
    } else if (ast instanceof AST.ConstantInteger) {
        return ast.value;
    } else if (ast instanceof AST.ConstantString) {
        return '"' + encodeString(ast.value) + '"';
    } else if (ast instanceof AST.ConstantUnit) {
        return 'undefined';
    } else if (ast instanceof AST.Declaration) {
        if (ast.expression instanceof AST.Lambda) {
            return spaces() + 'function ' + ast.name + '(' + ast.expression.variables[0] + ') {\n' + (ast.expression.variables.length == 1 ? '  return ' + astToJavascript(ast.expression.expression, indentation + 1) + ';\n' : '  return ' + astToJavascript(new AST.Lambda(ast.expression.variables.slice(1), ast.expression.expression), indentation + 1) + ';\n') + '}';
        } else {
            return spaces() + 'const ' + ast.name + ' = ' + astToJavascript(ast.expression) + ';';
        }
    } else if (ast instanceof AST.Division) {
        return '(' + astToJavascript(ast.left, indentation) + ' / ' + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.Equal) {
        return '(' + astToJavascript(ast.left, indentation) + " == " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.Expressions) {
        return '(() => {\n' + spaces(indentation + 2)
            + ast.expressions.slice(0, ast.expressions.length - 1).map(e => astToJavascript(e, indentation + 2)).join(";\n" + spaces(indentation + 2))
            + (ast.expressions.length > 1 ? ';\n' : '')
            + spaces(indentation + 2) + 'return ' + astToJavascript(ast.expressions[ast.expressions.length - 1]) + ';\n'
            + spaces(indentation + 1) + "})()";
    } else if (ast instanceof AST.GreaterThan) {
        return '(' + astToJavascript(ast.left, indentation) + " > " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.GreaterThanEqual) {
        return '(' + astToJavascript(ast.left, indentation) + " >= " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.Identifier) {
        return ast.name;
    } else if (ast instanceof AST.If) {
        return '(' + astToJavascript(ast.ifExpr, indentation) + "\n" + spaces(indentation + 1) + "? " + astToJavascript(ast.thenExpr, indentation + 1) + "\n" + spaces(indentation + 1) + ": " + astToJavascript(ast.elseExpr, indentation + 1) + ')';
    } else if (ast instanceof AST.Import) {
        const fileName = ast.url.value.substring(5);

        return 'const ' + ast.id.name + " = require('" + (fileName.startsWith('./') || fileName.startsWith('/') ? fileName : './' + fileName) + "');";
    } else if (ast instanceof AST.InfixOperator) {
        return infixOperators[ast.operator];
    } else if (ast instanceof AST.Lambda) {
        const tmpResult = '(' + Array.foldr(astToJavascript(ast.expression, indentation), (accumulator, item) => "(" + item + " => " + accumulator + ")", ast.variables) + ')';
        return tmpResult.substr(1, tmpResult.length - 2);
    } else if (ast instanceof AST.LessThan) {
        return '(' + astToJavascript(ast.left, indentation) + " < " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.LessThanEqual) {
        return '(' + astToJavascript(ast.left, indentation) + " <= " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.Module) {
        const imports = ast.imports.map(i => astToJavascript(i, indentation)).join('\n');

        const suffix = ast.declarations.length == 0 && !ast.optionalExpression.isDefined() ? '\nmodule.exports = {\n' + spaces(1) + '_$ASSUMPTIONS\n};' :
            ast.declarations.length > 0 && !ast.optionalExpression.isDefined() ? '\nmodule.exports = {\n' + ast.declarations.map(d => spaces(1) + d.name).join(',\n') + ',\n' + spaces(1) + '_$ASSUMPTIONS\n};' :
                ast.declarations.length > 0 && ast.optionalExpression.isDefined() ? '\nmodule.exports = {\n' + ast.declarations.map(d => spaces(1) + d.name).join(',\n') + ',\n' + spaces(1) + '_$EXPR,\n' + spaces(1) + '_$ASSUMPTIONS\n};' :
                '\nmodule.exports = {\n' + spaces(1) + '_$EXPR,\n' + spaces(1) + '_$ASSUMPTIONS\n};';

        return (imports.length == 0 ? '' : imports + '\n\n')
            + ast.declarations.map(d => astToJavascript(d, indentation)).join('\n\n')
            + (ast.optionalExpression.isDefined() ? '\n\nconst _$EXPR = ' + astToJavascript(ast.optionalExpression.orElse(), indentation) + ';' : '')
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
    } else if (ast instanceof AST.Multiplication) {
        return '(' + astToJavascript(ast.left, indentation) + " * " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.QualifiedIdentifier) {
        return ast.module + "." + ast.identifier;
    } else if (ast instanceof AST.StringConcat) {
        return '(' + astToJavascript(ast.left, indentation) + " + " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.Subtraction) {
        return '(' + astToJavascript(ast.left, indentation) + " - " + astToJavascript(ast.right, indentation) + ')';
    } else if (ast instanceof AST.UnaryPlus) {
        return '(+' + astToJavascript(ast.operand) + ')';
    } else if (ast instanceof AST.UnaryNegate) {
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