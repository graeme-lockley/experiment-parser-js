import file:./TupleHelper as TH;

import file:./Object as Object;


Tuple f s =
    TH.Tuple f s;


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
    Object.eq (mapFirst ((+) 1) (Tuple 1 "hello")) (Tuple 2 "hello")
};

mapSecond f t =
    Tuple (first t) (f (second t))
assumptions {
    Object.eq (mapSecond ((+) 1) (Tuple "hello" 1)) (Tuple "hello" 2)
};