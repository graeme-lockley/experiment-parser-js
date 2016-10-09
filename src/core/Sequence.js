"use strict";

const Result = require('./Result');


class Sequence {
    constructor(state = {}) {
        this._state = Result.Ok(state);
    }

    assign(n, e) {
        if (this._state.isOk()) {
            const eResult = e(this._state.getOkOrElse());
            if (eResult.isOk()) {
                this._state.getOkOrElse()[n] = eResult.getOkOrElse();
            } else {
                this._state = eResult;
            }
        }
        return this;
    }

    return(e) {
        if (this._state.isOk()) {
            return e(this._state.getOkOrElse());
        } else {
            return this._state;
        }
    }
}


function seq() {
    return new Sequence();
}

module.exports = {
    seq
};