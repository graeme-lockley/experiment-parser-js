import file:./RecordHelper as Helper;

import file:./Maybe as Maybe;

import file:./Debug as DEBUG;


get name d =
    let {
        tmpResult = Helper.get name d
    } in
        if tmpResult then
            Maybe.Just tmpResult
        else
            Maybe.Nothing
assumptions {
    DEBUG.eq (get "hello" (mk1 "hello" 2)) (Maybe.Just 2);
    DEBUG.eq (get "hello" mk0) Maybe.Nothing
};


size m =
    keys.length
        where {
            keys = Object.keys m
        };


set1 =
    Helper.set1;


set2 =
    Helper.set2;


set3 =
    Helper.set3;


mk0 =
    Helper.mk0;


mk1 =
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