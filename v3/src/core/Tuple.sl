import file:./Record as Record;

import file:./Debug as DEBUG;


Tuple f s =
    Record.mk2 "_fst" f "_snd" s;


first t =
    t._fst
assumptions {
    first (Tuple 1 "hello") == 1
};


second t =
    t._snd
assumptions {
    second (Tuple 1 "hello") == "hello"
};


mapFirst f t =
    Tuple (f (first t)) (second t)
assumptions {
    DEBUG.eq (mapFirst ((+) 1) (Tuple 1 "hello")) (Tuple 2 "hello")
};

mapSecond f t =
    Tuple (first t) (f (second t))
assumptions {
    DEBUG.eq (mapSecond ((+) 1) (Tuple "hello" 1)) (Tuple "hello" 2)
};