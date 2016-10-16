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

    setFst(fst) {
        return new TupleImpl(fst, this._snd);
    }

    setSnd(snd) {
        return new TupleImpl(this._fst, snd);
    }
}

function Tuple(fst) {
    return snd => new TupleImpl(fst, snd);
}

module.exports = {
    Tuple
};