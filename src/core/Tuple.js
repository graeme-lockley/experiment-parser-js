"use strict";

var Tuple = function (fst, snd) {
    return [fst, snd];
};

function fst(tuple) {
    return tuple[0];
}

function snd(tuple) {
    return tuple[1];
}

function setFst(fst, tuple) {
    return Tuple(fst, snd(tuple));
}

function setSnd(snd, tuple) {
    return Tuple(fst(tuple), snd);
}

module.exports = {
    Tuple: Tuple,
    fst: fst,
    snd: snd,
    setFst: setFst,
    setSnd: setSnd
};