"use strict";

const Result = require('./Result');


class Sequence {
    constructor(state = {}) {
        this._state = Result.Ok(state);
    }

    assign(n, e, logMessage = null) {
        if (this._state.isOk()) {
            try {
                if (logMessage != null) {
                    console.time(logMessage(this._state.getOkOrElse({})));
                }
                const eResult = e(this._state.getOkOrElse());

                if (Result.is(eResult)) {
                    if (eResult.isOk()) {
                        this._state.getOkOrElse()[n] = eResult.getOkOrElse();
                    } else {
                        this._state = eResult;
                    }
                } else {
                    this._state.getOkOrElse()[n] = eResult;
                }
            } catch (e) {
                this._state = Result.Error(e);
            }
            finally {
                if (logMessage != null) {
                    console.timeEnd(logMessage(this._state.getOkOrElse({})));
                }
            }
        }
        return this;
    }

    return(e) {
        if (this._state.isOk()) {
            const result = e(this._state.getOkOrElse());

            if (Result.is(result)) {
                return result;
            } else {
                return Result.Ok(result);
            }
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