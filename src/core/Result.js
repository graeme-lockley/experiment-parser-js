"use strict";

class OkImpl {
    constructor(value) {
        this._ok = value;
    }

    static isOk() {
        return true;
    }

    static isError() {
        return false;
    }

    getOkOrElse(elseValue) {
        return this._ok;
    }

    static getErrorOrElse(elseValue) {
        return elseValue;
    }

    map(okFn, errorFn) {
        return okFn(this._ok);
    }
}

class ErrorImpl {
    constructor(value) {
        this._error = value;
    }

    static isOk() {
        return false;
    }

    static isError() {
        return true;
    }

    static getOkOrElse(elseValue) {
        return elseValue;
    }

    getErrorOrElse(elseValue) {
        return this._error;
    }

    map(okFn, errorFn) {
        return errorFn(this._error);
    }
}

function Ok(value) {
    return new OkImpl(value);
}

function Error(value) {
    return new ErrorImpl(value);
}

module.exports = {
    Ok, Error
};