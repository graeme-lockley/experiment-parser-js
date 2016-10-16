"use strict";

function Tuple(first) {
    return second => {
        return {
            _fst: first,
            _snd: second
        }
    };
}

module.exports = {
    Tuple
};