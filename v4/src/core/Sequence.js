"use strict";

const Result = require('./Result');


class Sequence {
    constructor(state = {}) {
        this._state = Result.Ok(state);
    }

    assign(n, e, logMessage = null) {
        if (Result.isOk(this._state)) {
            try {
                if (logMessage != null) {
                    console.time(logMessage(Result.withDefault({})(this._state)));
                }
                const eResult = e(Result.withDefault()(this._state));

                if (eResult != undefined && Result.is(eResult)) {
                    if (Result.isOk(eResult)) {
                        Result.withDefault()(this._state)[n] = Result.withDefault()(eResult);
                    } else {
                        this._state = eResult;
                    }
                } else {
                    Result.withDefault()(this._state)[n] = eResult;
                }
            } catch (e) {
                this._state = Result.Error(e);
            }
            finally {
                if (logMessage != null) {
                    console.timeEnd(logMessage(Result.withDefault({})(this._state)));
                }
            }
        }
        return this;
    }

    return(e) {
        if (Result.isOk(this._state)) {
            const result = e(Result.withDefault()(this._state));

            if (result != undefined && Result.is(result)) {
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