class OkImpl {
    constructor(value) {
        this._ok = value;
    }

    _map(okFn, _) {
        return new OkImpl(okFn(this._ok));
    }

    _flatMap(okFn, _) {
        return okFn(this._ok);
    }
}

class ErrorImpl {
    constructor(value) {
        this._error = value;
    }

    _map(_, errorFn) {
        return new ErrorImpl(errorFn(this._error));
    }

    _flatMap(_, errorFn) {
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
    return errorFn => r => r._map(okFn, errorFn);
}

function flatMap(okFn) {
    return errorFn => r => r._flatMap(okFn, errorFn);
}

function is(value) {
    return value instanceof OkImpl || value instanceof ErrorImpl;
}

module.exports = {
    Ok, Error, map, flatMap, is
};