import file:./RecordHelper as Helper;

import file:./Maybe as Maybe;

import file:./Debug as DEBUG;


lookup name d =
    let {
        tmpResult = Helper.get name d
    } in
        if tmpResult then
            Maybe.Just tmpResult
        else
            Maybe.Nothing
assumptions {
    DEBUG.eq (lookup "hello" (singleton "hello" 2)) (Maybe.Just 2);
    DEBUG.eq (lookup "hello" empty) Maybe.Nothing
};


size m =
    keys.length
        where {
            keys = Object.keys m
        };


map f m =
    Helper.map f m
assumptions {
    DEBUG.eq (size (map ((+) 1) (singleton "a" 1))) 1;
    DEBUG.eq (lookup "a" (map ((+) 1) (singleton "a" 1))) (Maybe.Just 2);
    DEBUG.eq (lookup "b" (map ((+) 1) (singleton "a" 1))) Maybe.Nothing
};


set1 =
    Helper.set1;


set2 =
    Helper.set2;


set3 =
    Helper.set3;


empty =
    Helper.mk0 ();


singleton =
    Helper.mk1;


mk2 =
    Helper.mk2;


mk3 =
    Helper.mk3;


mk4 =
    Helper.mk4;


mk5 =
    Helper.mk5;


mk6 =
    Helper.mk6;


mk7 =
    Helper.mk7;


mk8 =
    Helper.mk8;


mk9 =
    Helper.mk9;


union a b =
    Helper.union a b;


fold f z r =
    Helper.fold f z r;