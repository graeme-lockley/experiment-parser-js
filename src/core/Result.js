"use strict";

var Ok = function (value) {
    return {
        ok: value,

        isOk: function () {
            return true;
        },
        isError: function () {
            return false;
        },
        getOkOrElse: function(ignore) {
            return this.ok;
        },
        getErrorOrElse: function(errorValue) {
            return errorValue;
        }
    };
};

var Error = function (value) {
    return {
        error: value,

        isOk: function () {
            return false;
        },
        isError: function () {
            return true;
        },
        getOkOrElse: function(okValue) {
            return okValue;
        },
        getErrorOrElse: function(ignore) {
            return this.error;
        }
    };
};

module.exports = {
    Ok: Ok,
    Error: Error
};