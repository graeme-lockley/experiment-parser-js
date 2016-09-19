"use strict";

var Ok = function (value) {
    return {
        ok: value,

        isOk: function () {
            return true;
        }
    };
};

var Error = function (value) {
    return {
        error: value,

        isOk: function () {
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
    Ok: Ok,
    Error: Error,
    isOk: isOk,
    isError: isError,
    getOkOrElse: getOkOrElse,
    getErrorOrElse: getErrorOrElse
};