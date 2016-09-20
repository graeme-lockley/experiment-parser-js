"use strict";

var Tuple = require("../../src/core/Tuple");
var Chai = require("../../bower_components/chai/chai");

var expect = Chai.expect;

describe('Core/Tuple', function () {
    describe('given a tuple of (10, "abc")', () => {
        var tuple = Tuple.Tuple(10, 'abc');

        it('fst should return 10', () => expect(Tuple.fst(tuple)).to.equal(10));
        it('snd should return "abc"', () => expect(Tuple.snd(tuple)).to.equal('abc'));

        describe('setFst(20) on tuple', () => {
            var tuple2 = Tuple.setFst(20, tuple);

            it('fst should return 20', () => expect(Tuple.fst(tuple2)).to.equal(20));
            it('snd should return "abc"', () => expect(Tuple.snd(tuple2)).to.equal('abc'));
        });

        describe('setSnd(100) on tuple', () => {
            var tuple2 = Tuple.setSnd(100, tuple);

            it('fst should return 10', () => expect(Tuple.fst(tuple2)).to.equal(10));
            it('snd should return 100', () => expect(Tuple.snd(tuple2)).to.equal(100));
        });
    });
});