"use strict";

class TupleImpl {
    constructor(fst, snd) {
        this._fst = fst;
        this._snd = snd;
    }

    get fst() {
        return this._fst;
    }

    get snd() {
        return this._snd;
    }
}

function Tuple(fst) {
    return snd => new TupleImpl(fst, snd);
}

module.exports = {
    Tuple
};