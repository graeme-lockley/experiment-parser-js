"use strict";

const Result = require("../../src/core/Result");
const Sequence = require("../../src/core/Sequence");
const expect = require("chai").expect;

describe('Core/Sequence', () => {
    const sequence = new Sequence.seq();

    it('given a set of assignments the result is correctly calculated', () => {
        const value = sequence
            .assign('a', s => Result.Ok(10))
            .assign('b', s => Result.Ok(s.a + 5))
            .assign('c', s => Result.Ok(s.a + s.b))
            .return(s => Result.Ok(s.c));

        expect(value.getOkOrElse()).to.equal(25);
    });

    it('given a set of assignments with one returning an error then the error is returned', () => {
        const value = sequence
            .assign('a', s => Result.Ok(10))
            .assign('b', s => Result.Error('Some error'))
            .assign('c', s => Result.Ok(s.a + s.b))
            .return(s => s.c);

        expect(value.getErrorOrElse()).to.equal('Some error');
    });
});
