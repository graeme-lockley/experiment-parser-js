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

    unflatMap(okFn, _) {
        return new OkImpl(okFn(this._ok));
    }

    map(okFn, _) {
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

    unflatMap(_, errorFn) {
        return new ErrorImpl(errorFn(this._error));
    }

    map(_, errorFn) {
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

function map(okFn) {
    return errorFn => r => r.unflatMap(okFn, errorFn);
}

function flatMap(okFn) {
    return errorFn => r => r.map(okFn, errorFn);
}

function is(value) {
    return value instanceof OkImpl || value instanceof ErrorImpl;
}

module.exports = {
    Ok, Error, map, flatMap, is
};