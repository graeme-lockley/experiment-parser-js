"use strict";

class TupleImpl {
    constructor(fst, snd) {
        this._fst = fst;
        this._snd = snd;
    }
}

function Tuple(fst) {
    return snd => new TupleImpl(fst, snd);
}

module.exports = {
    Tuple
};