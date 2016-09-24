const AST = require('./AST');
const Array = require('./core/Array');


function astToJavascript(ast) {
    if (ast instanceof AST.ConstantInteger) {
        return ast.value;
    } else if (ast instanceof AST.Identifier) {
        return ast.name;
    } else if (ast instanceof AST.Lambda) {
        const tmpResult = Array.foldr(astToJavascript(ast.expression), (accumulator, item) => "(" + item + " => " + accumulator + ")", ast.variables);
        return tmpResult.substr(1, tmpResult.length - 2);
    } else if (ast instanceof AST.Apply) {
        return astToJavascript(ast.expressions[0]) + ast.expressions.slice(1).map(x => "(" + astToJavascript(x) + ")").join('');
    } else if (ast instanceof AST.Declaration) {
        if (ast.expression instanceof AST.Lambda) {
            return 'function ' + ast.name + '(' + ast.expression.variables[0] + ') {\n' + (ast.expression.variables.length == 1 ? '  return ' + astToJavascript(ast.expression.expression) + ';\n' : '  return ' + astToJavascript(AST.newLambda(ast.expression.variables.slice(1), ast.expression.expression)) + ';\n') + '}';
        } else {
            return 'const ' + ast.name + ' = ' + astToJavascript(ast.expression) + ';';
        }
    } else if (ast instanceof AST.Declarations) {
        return ast.declarations.map(d => astToJavascript(d)).join('\n\n');
    }
}


module.exports = {
    astToJavascript
};