"use strict";

class SomeImpl {
    constructor(value) {
        this._value = value;
    }

    isDefined() {
        return true;
    }

    isEmpty() {
        return false;
    }

    orElse(elseValue) {
        return this._value;
    }

    map(mapFunction) {
        return new SomeImpl(mapFunction(this._value));
    }
}

class NoneImpl {
    constructor() {
    }

    isDefined() {
        return false;
    }

    isEmpty() {
        return true;
    }

    orElse(elseValue) {
        return elseValue;
    }

    map(mapFunction) {
        return None;
    }
}

function Some(value) {
    return new SomeImpl(value);
}

const None = new NoneImpl();

module.exports = {
    Some, None
};