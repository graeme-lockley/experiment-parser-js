"use strict";

var Parser = require("../src/Parser");
var Lexer = require("../src/Lexer");
var Chai = require("../bower_components/chai/chai");

var expect = Chai.expect;

describe('Parser', function () {
    // describe('given the input "((\\a \\b -> (add a b)) 10 200)"', function () {
    //     var result = Parser.parseString('((\\a \\b -> (add a b)) 10 200)');
    //
    //     it("should parse without any errors", function () {
    //         expect(result.isOk()).to.equal(true);
    //     });
    //
    //     it('the returned ADT, when pretty printed, should equal "BLAH"', function () {
    //
    //     });
    // });

    describe ('given the input "123" to parseTerm', function() {
        var result = Parser.parseTerm(Lexer.fromString("123"));

        it ("should parse without any errors", function() {
            expect(result.isOk()).to.equal(true);
        });
        it ("should have the int value 123", function() {
            expect(result.getOkOrElse(null).fst).to.equal(123);
        });
        it ("should have the next token of EOF", function() {
            expect(result.getOkOrElse(null).snd.token.id).to.equal(Lexer.TokenEnum.EOF);
        });
    })
});
