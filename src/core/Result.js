"use strict";

class OkImpl {
    constructor(value) {
        this._ok = value;
    }

    isOk() {
        return true;
    }

    isError() {
        return false;
    }

    getOkOrElse(elseValue) {
        return this._ok;
    }

    getErrorOrElse(elseValue) {
        return elseValue;
    }

    map(okFn, errorFn) {
        return okFn(this._ok);
    }

    okay(okFn) {
        okFn(this._ok);
        return this;
    }

    error(errorFn) {
        return this;
    }
}

class ErrorImpl {
    constructor(value) {
        this._error = value;
    }

    isOk() {
        return false;
    }

    isError() {
        return true;
    }

    getOkOrElse(elseValue) {
        return elseValue;
    }

    getErrorOrElse(elseValue) {
        return this._error;
    }

    map(okFn, errorFn) {
        return errorFn(this._error);
    }

    okay(okFn) {
        return this;
    }

    error(errorFn) {
        errorFn(this._error);
        return this;
    }
}


function Ok(value) {
    return new OkImpl(value);
}


function Error(value) {
    return new ErrorImpl(value);
}


function is(value) {
    return value instanceof OkImpl || value instanceof ErrorImpl;
}


module.exports = {
    Ok, Error, is
};