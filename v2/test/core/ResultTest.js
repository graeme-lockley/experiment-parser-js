"use strict";

const Result = require("../../src/core/Result");
const expect = require("chai").expect;

describe('Core/Result', function () {
    describe('given an Ok created with a content of 123', () => {
        const result = Result.Ok(123);

        it('should return true for isOk', () => expect(result.isOk()).to.equal(true));
        it('should return false for isError', () => expect(result.isError()).to.equal(false));
        it('should return 123 when asking getOkOrElse', () => expect(result.getOkOrElse(-1)).to.equal(123));
        it('should return -1 when asking getErrorOrElse', () => expect(result.getErrorOrElse(-1)).to.equal(-1));
    });

    describe('given an Error created with a content of 123', () => {
        const result = Result.Error(123);

        it('should return false for isOk', () => expect(result.isOk()).to.equal(false));
        it('should return true for isError', () => expect(result.isError()).to.equal(true));
        it('should return -1 when asking getOkOrElse', () => expect(result.getOkOrElse(-1)).to.equal(-1));
        it('should return 123 when asking getErrorOrElse', () => expect(result.getErrorOrElse(-1)).to.equal(123));
    });
});