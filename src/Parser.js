"use strict";

var Result = require("./core/Result");
var Lexer = require("./Lexer");
var Tuple = require("./core/Tuple");


/**
 * EXPR :== TERM { TERM }
 * TERM :== CONSTANT_INTEGER
 *        | IDENTIFIER
 *        | '\\' IDENTIFIER { '\\' IDENTIFIER } '->' EXPR
 *        | '(' EXPR ')'
 */


function parseExpr(lexer) {
    return parseTerm(lexer);
}

function parseTerm(lexer) {
    var token = lexer.token.id;

    if (token == Lexer.TokenEnum.CONSTANT_INTEGER) {
        return Result.Ok(Tuple.Tuple(parseInt(lexer.token.text), lexer.next()));
    }
    return Result.Error("Expected a constant integer");
}

var parseString = function (input) {
    var context = Lexer.fromString(input);

    return parseExpr(context);
};


module.exports = {
    parseString: parseString,
    parseTerm: parseTerm
};