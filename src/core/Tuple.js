"use strict";

var Tuple = function (fst, snd) {
    return {
        fstA: fst,
        sndA: snd
    };
};

function fst(tuple) {
    return tuple.fstA;
}

function snd(tuple) {
    return tuple.sndA;
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