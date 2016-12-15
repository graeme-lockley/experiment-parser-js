"use strict";

const Maybe = require('./Maybe');


const empty = [];


function append(e) {
    return a => [...a, e];
}


function prepend(e) {
    return a => [e, ...a];
}


function foldr(foldFunction) {
    return initValue => arr => {
        let result = initValue;

        for (let index = arr.length - 1; index >= 0; index -= 1) {
            result = foldFunction(result)(arr[index]);
        }

        return result;
    }
}


function foldl(foldFunction) {
    return initValue => arr => {
        let result = initValue;

        for (let index = 0; index < arr.length; index += 1) {
            result = foldFunction(result)(arr[index]);
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


function map(f) {
    return a => {
        const result = [];
        for (let index = 0; index < a.length; index += 1) {
            result.push(f(a[index]));
        }
        return result;
    };
}


function filter(f) {
    return a => {
        const result = [];
        for (let index = 0; index < a.length; index += 1) {
            if (f(a[index])) {
                result.push(a[index]);
            }
        }
        return result;
    }
}


function findMap(f) {
    return a => {
        for (let i = 0; i < a.length; i += 1) {
            const potentialResult = f(a[i]);

            if (Maybe.isJust (potentialResult)) {
                return potentialResult;
            }
        }

        return Maybe.Nothing;
    }
}


function at(i) {
    return a => {
        const result = a[i];
        return result == 0 || result ? Maybe.Just(result) : Maybe.Nothing;
    }
}


function slice(startIndex) {
    return endIndex => array => array.slice(startIndex, endIndex);
}


module.exports = {
    append,
    at,
    empty,
    filter,
    foldl,
    foldr,
    findFirst,
    findMap,
    map,
    prepend,
    slice
};