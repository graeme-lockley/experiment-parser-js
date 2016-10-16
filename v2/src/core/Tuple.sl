import file:./TupleHelper as TH;

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
    first (mapFirst ((+) 1) (Tuple 1 "hello")) == 2
};

mapSecond f t =
    Tuple (first t) (f (second t))
assumptions {
    second (mapSecond ((+) 1) (Tuple "hello" 1)) == 2
};