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