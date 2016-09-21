const AST = require('./AST');


function foldr(initValue, foldFunction, arr) {
    let result = initValue;

    for (let index = arr.length - 1; index >= 0; index -= 1) {
        result = foldFunction(result, arr[index]);
    }

    return result;
}


function astToJavascript(ast) {
    if (ast instanceof AST.ConstantInteger) {
        return ast.value;
    } else if (ast instanceof AST.Identifier) {
        return ast.name;
    } else if (ast instanceof AST.Lambda) {
        const tmpResult = foldr(astToJavascript(ast.expression), (accumulator, item) => "(" + item + " => " + accumulator + ")", ast.variables);
        return tmpResult.substr(1, tmpResult.length - 2);
    }
}

module.exports = {
    astToJavascript
};