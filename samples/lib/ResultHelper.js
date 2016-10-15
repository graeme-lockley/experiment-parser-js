class OkImpl {
    constructor(value) {
        this._ok = value;
    }

    map(okFn, _) {
        return new OkImpl(okFn(this._ok));
    }

    flatMap(okFn, _) {
        return okFn(this._ok);
    }
}

class ErrorImpl {
    constructor(value) {
        this._error = value;
    }

    map(_, errorFn) {
        return new ErrorImpl(errorFn(this._error));
    }

    flatMap(_, errorFn) {
        return errorFn(this._error);
    }
}


function Ok(value) {
    return new OkImpl(value);
}

function Error(value) {
    return new ErrorImpl(value);
}

function map(okFn) {
    return errorFn => r => r.map(okFn, errorFn);
}

function flatMap(okFn) {
    return errorFn => r => r.flatMap(okFn, errorFn);
}

module.exports = {
    Ok, Error, map, flatMap
};