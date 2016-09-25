"use strict";

const Optional = require('./Option');


function foldr(initValue, foldFunction, arr) {
    let result = initValue;

    for (let index = arr.length - 1; index >= 0; index -= 1) {
        result = foldFunction(result, arr[index]);
    }

    return result;
}


function findFirst(predicate, arr) {
    for (let index = 0; index < arr.length; index += 1) {
        if (predicate(arr[index])) {
            return Optional.Some(arr[index]);
        }
    }
    return Optional.None;
}


module.exports = {
    foldr, findFirst
};