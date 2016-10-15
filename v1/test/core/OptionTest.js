"use strict";

const Option = require("../../src/core/Option");
const expect = require("chai").expect;

describe('Core/Option', function () {
    describe('given a Some created with a content of 123', () => {
        const option = Option.Some(123);

        it('should return true for isDefined', () => expect(option.isDefined()).to.be.true);
        it('should return false for isEmpty', () => expect(option.isEmpty()).to.be.false);
        it('should return 123 for orElse(-1)', () => expect(option.orElse(-1)).to.equal(123));
        it('should return 246 if map(x => x * 2) is applied', () => expect(option.map(_ => _ * 2).orElse(-1)).to.equal(246));
    });

    describe('given a None', () => {
        const option = Option.None;

        it('should return false for isDefined', () => expect(option.isDefined()).to.be.false);
        it('should return true for isEmpty', () => expect(option.isEmpty()).to.be.true);
        it('should return -1 for orElse(-1)', () => expect(option.orElse(-1)).to.equal(-1));
        it('should return -1 if map(x => x * 2) is applied', () => expect(option.map(_ => _ * 2).orElse(-1)).to.equal(-1));
    });
});