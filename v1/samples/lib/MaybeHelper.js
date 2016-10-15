class JustImpl {
    constructor(value) {
        this._value = value;
    }

    isJust() {
        return true;
    }

    withDefault(elseValue) {
        return this._value;
    }

    map(mapFunction) {
        return new JustImpl(mapFunction(this._value));
    }
}

class NothingImpl {
    constructor() {
    }

    isJust() {
        return false;
    }

    withDefault(elseValue) {
        return elseValue;
    }

    map(mapFunction) {
        return this;
    }
}

function Just(value) {
    return new JustImpl(value);
}

const Nothing = new NothingImpl();

function isJust(o) {
    return o.isJust();
}

function withDefault(elseValue) {
    return o => o.withDefault(elseValue);
}

function map(f) {
    return o => o.map(f);
}

module.exports = {
    Just, Nothing, isJust, withDefault, map
};