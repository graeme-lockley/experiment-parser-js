"use strict";

var Tuple = require("../../src/core/Tuple");
var Chai = require("../../bower_components/chai/chai");

var expect = Chai.expect;

describe('Core/Tuple', function () {
    describe('given a tuple of (10, "abc")', () => {
        var tuple = Tuple.Tuple(10, 'abc');

        it('fst should return 10', () => expect(tuple.fst).to.equal(10));
        it('snd should return "abc"', () => expect(tuple.snd).to.equal('abc'));

        describe('setFst(20) on tuple', () => {
            var tuple2 = tuple.setFst(20);

            it('fst should return 20', () => expect(tuple2.fst).to.equal(20));
            it('snd should return "abc"', () => expect(tuple2.snd).to.equal('abc'));
        });

        describe('setSnd(100) on tuple', () => {
            var tuple2 = tuple.setSnd(100);

            it('fst should return 10', () => expect(tuple2.fst).to.equal(10));
            it('snd should return 100', () => expect(tuple2.snd).to.equal(100));
        });
    });
});