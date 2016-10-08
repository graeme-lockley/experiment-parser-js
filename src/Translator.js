const AST = require('./AST');
const Array = require('./core/Array');


function astToJavascript(ast, indentation = 0) {
    function spaces(count) {
        return '  '.repeat(count);
    }

    if (ast instanceof AST.Addition) {
        return astToJavascript(ast.left, indentation) + " + " + astToJavascript(ast.right, indentation);
    } else if (ast instanceof AST.Apply) {
        return astToJavascript(ast.expressions[0], indentation) + ast.expressions.slice(1).map(x => "(" + astToJavascript(x, indentation) + ")").join('');
    } else if (ast instanceof AST.BooleanAnd) {
        return ast.expressions.map(e => astToJavascript(e, indentation)).join(' && ');
    } else if (ast instanceof AST.BooleanNot) {
        return '!' + astToJavascript(ast.operand, indentation);
    } else if (ast instanceof AST.BooleanOr) {
        return ast.expressions.map(e => astToJavascript(e, indentation)).join(' || ');
    } else if (ast instanceof AST.Composition) {
        const variableName = '_$' + indentation;
        return '(' + variableName + ' => ' + astToJavascript(ast.left, indentation) + '(' + astToJavascript(ast.right, indentation) + '(' + variableName + ')))';
    } else if (ast instanceof AST.ConstantBoolean) {
        return ast.value ? 'true' : 'false';
    } else if (ast instanceof AST.ConstantInteger) {
        return ast.value;
    } else if (ast instanceof AST.ConstantString) {
        return '"' + ast.value + '"';
    } else if (ast instanceof AST.Declaration) {
        if (ast.expression instanceof AST.Lambda) {
            return spaces() + 'function ' + ast.name + '(' + ast.expression.variables[0] + ') {\n' + (ast.expression.variables.length == 1 ? '  return ' + astToJavascript(ast.expression.expression, indentation + 1) + ';\n' : '  return ' + astToJavascript(new AST.Lambda(ast.expression.variables.slice(1), ast.expression.expression), indentation + 1) + ';\n') + '}';
        } else {
            return spaces() + 'const ' + ast.name + ' = ' + astToJavascript(ast.expression) + ';';
        }
    } else if (ast instanceof AST.Equal) {
        return astToJavascript(ast.left, indentation) + " == " + astToJavascript(ast.right, indentation);
    } else if (ast instanceof AST.Identifier) {
        return ast.name;
    } else if (ast instanceof AST.If) {
        return astToJavascript(ast.ifExpr, indentation) + "\n" + spaces(indentation + 1) + "? " + astToJavascript(ast.thenExpr, indentation + 1) + "\n" + spaces(indentation + 1) + ": " + astToJavascript(ast.elseExpr, indentation + 1);
    } else if (ast instanceof AST.Import) {
        const fileName = ast.url.value.substring(5);

        return 'const ' + ast.id.name + " = require('" + fileName + "');";
    } else if (ast instanceof AST.Lambda) {
        const tmpResult = Array.foldr(astToJavascript(ast.expression, indentation), (accumulator, item) => "(" + item + " => " + accumulator + ")", ast.variables);
        return tmpResult.substr(1, tmpResult.length - 2);
    } else if (ast instanceof AST.LessThan) {
        return astToJavascript(ast.left, indentation) + " < " + astToJavascript(ast.right, indentation);
    } else if (ast instanceof AST.LessThanEqual) {
        return astToJavascript(ast.left, indentation) + " <= " + astToJavascript(ast.right, indentation);
    } else if (ast instanceof AST.Module) {
        const imports = ast.imports.map(i => astToJavascript(i, indentation)).join('\n');

        return (imports.length == 0 ? '' : imports + '\n\n')
        + ast.declarations.map(d => astToJavascript(d, indentation)).join('\n\n')
        + (ast.optionalExpression.isDefined() ? '\n\n' + astToJavascript(ast.optionalExpression.orElse(), indentation) : '');
    } else if (ast instanceof AST.Subtraction) {
        return astToJavascript(ast.left, indentation) + " - " + astToJavascript(ast.right, indentation);
    } else if (ast instanceof AST.QualifiedIdentifier) {
        return ast.module + "." + ast.identifier;
    }
}


module.exports = {
    astToJavascript
};