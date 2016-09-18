"use strict";

var Result = require("../../src/core/Result");
var Chai = require("../../bower_components/chai/chai");

var expect = Chai.expect;

describe('Core/Result', function () {
    describe('given an Ok created with a content of 123', function () {
        var result = Result.Ok(123);

        it('should return true for isOk', function () {
            expect(result.isOk()).to.equal(true);
        });
        it('should return false for isError', function () {
            expect(result.isError()).to.equal(false);
        });
        it('should return 123 when asking getOkOrElse', function () {
            expect(result.getOkOrElse(-1)).to.equal(123);
        });
        it('should return -1 when asking getErrorOrElse', function () {
            expect(result.getErrorOrElse(-1)).to.equal(-1);
        });
    });

    describe('given an Error created with a content of 123', function () {
        var result = Result.Error(123);

        it('should return false for isOk', function () {
            expect(result.isOk()).to.equal(false);
        });
        it('should return true for isError', function () {
            expect(result.isError()).to.equal(true);
        });
        it('should return -1 when asking getOkOrElse', function () {
            expect(result.getOkOrElse(-1)).to.equal(-1);
        });
        it('should return 123 when asking getErrorOrElse', function () {
            expect(result.getErrorOrElse(-1)).to.equal(123);
        });
    });
});