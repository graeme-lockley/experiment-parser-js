"use strict";

var Tuple = function (fst, snd) {
    return {
        fst: fst,
        snd: snd,

        setFst: function (fst) {
            return Tuple(fst, this.snd);
        },
        setSnd: function (snd) {
            return Tuple(this.fst, snd);
        }
    };
};

module.exports = {
    Tuple: Tuple
};