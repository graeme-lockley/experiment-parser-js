"use strict";

var Ok = function (value) {
    return {
        ok: value,

        isOk() {
            return true;
        }
    };
};

var Error = function (value) {
    return {
        error: value,

        isOk() {
            return false;
        }
    };
};

function isOk(result) {
    return result.isOk();
}

function isError(result) {
    return !isOk(result);
}

function getOkOrElse(result, elseValue) {
    return isOk(result) ? result.ok : elseValue;
}

function getErrorOrElse(result, elseValue) {
    return isError(result) ? result.error : elseValue;
}

module.exports = {
    Ok, Error, isOk, isError, getOkOrElse, getErrorOrElse
};