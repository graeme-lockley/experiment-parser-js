"use strict";

const Result = require("../../src/core/Result");
const Sequence = require("../../src/core/Sequence");
const expect = require("chai").expect;

describe('Core/Sequence', () => {

    it('given a set of assignments the result is correctly calculated', () => {
        const value = Sequence.seq()
            .assign('a', s => Result.Ok(10))
            .assign('b', s => Result.Ok(s.a + 5))
            .assign('c', s => Result.Ok(s.a + s.b))
            .return(s => Result.Ok(s.c));

        expect(Result.withDefault()(value)).to.equal(25);
    });

    it('given a set of assignments with one returning an error then the error is returned', () => {
        const value = Sequence.seq()
            .assign('a', s => Result.Ok(10))
            .assign('b', s => Result.Error('Some error'))
            .assign('c', s => Result.Ok(s.a + s.b))
            .return(s => Result.Ok(s.c));

        expect(value.getErrorOrElse()).to.equal('Some error');
    });

    it('given a set of assignments without the assignment wrapped in a Result then auto-wrap', () => {
        const value = Sequence.seq()
            .assign('a', s => 10)
            .assign('b', s => s.a + 5)
            .assign('c', s => s.a + s.b)
            .return(s => s.c);

        expect(Result.withDefault()(value)).to.equal(25);
    });

    it('given a set of assignments with one throwing an exception then an error is returned', () => {
        const value = Sequence.seq()
            .assign('a', s => 10)
            .assign('b', s => {
                throw 'My Error';
            })
            .assign('c', s => s.a + s.b)
            .return(s => s.c);

        expect(value.getErrorOrElse()).to.equal('My Error');
    });
});
