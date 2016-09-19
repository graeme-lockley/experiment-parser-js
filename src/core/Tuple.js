"use strict";

var Tuple = function (fst, snd) {
    return {
        fst: fst,
        snd: snd
    };
};

function fst(tuple) {
    return tuple.fst;
}

function snd(tuple) {
    return tuple.snd;
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