"use strict";

const ObjectHelper = require("./ObjectHelper");


function log(label) {
    return value => {
        console.log(label + ": " + ObjectHelper.show(value));
        return value;
    };
}


module.exports = {
    log
};
