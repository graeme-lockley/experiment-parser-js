"use strict";

const Maybe = require('./Maybe');


function foldr(foldFunction) {
    return initValue => arr => {
        let result = initValue;

        for (let index = arr.length - 1; index >= 0; index -= 1) {
            result = foldFunction(result, arr[index]);
        }

        return result;
    }
}


function findFirst(predicate) {
    return arr => {
        for (let index = 0; index < arr.length; index += 1) {
            if (predicate(arr[index])) {
                return Maybe.Just(arr[index]);
            }
        }
        return Maybe.Nothing;
    }
}


module.exports = {
    foldr, findFirst
};