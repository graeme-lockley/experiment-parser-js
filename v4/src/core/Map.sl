import file:./RecordHelper as Helper;

import file:./Array as List;
import file:./Maybe as Maybe;
import file:./Set as Set;
import file:./Tuple as Tuple;

import file:./Debug as DEBUG;


find name d =
    let {
        tmpResult = Helper.get name d
    } in
        if tmpResult then
            Maybe.Just tmpResult
        else
            Maybe.Nothing
assumptions {
    DEBUG.eq (find "hello" (singleton "hello" 2)) (Maybe.Just 2);
    DEBUG.eq (find "hello" empty) Maybe.Nothing
};


findWithDefault defaultResult name d =
    let {
        tmpResult = Helper.get name d
    } in
        if tmpResult then
            tmpResult
        else
            defaultResult
assumptions {
    DEBUG.eq (findWithDefault 3 "hello" (singleton "hello" 2)) 2;
    DEBUG.eq (findWithDefault 3 "hello" empty) 3
};


contains name d =
    Helper.has name d;


size m =
    keys.length
        where {
            keys = Object.keys m
        };


map f m =
    Helper.map f m
assumptions {
    DEBUG.eq (size (map ((+) 1) (singleton "a" 1))) 1;
    DEBUG.eq (find "a" (map ((+) 1) (singleton "a" 1))) (Maybe.Just 2);
    DEBUG.eq (find "b" (map ((+) 1) (singleton "a" 1))) Maybe.Nothing
};


fromList list =
    List.foldl (\acc \item -> insert (Tuple.first item) (Tuple.second item) acc) empty list
assumptions {
    DEBUG.eq (fromList (List.mk2 (Tuple.Tuple "hello" 1) (Tuple.Tuple "world" 2))) (mk2 "hello" 1 "world" 2)
};


toList map =
    List.map (\key -> Tuple.Tuple key (findWithDefault () key map)) (Helper.keys map);


keys s =
    Set.fromList (Helper.keys s)
assumptions {
    DEBUG.eq (keys (mk4 "a" 1 "b" 2 "c" 3 "d" 4)) (Set.insert "a" (Set.insert "b" (Set.insert "c" (Set.insert "d" Set.empty))))
};


union m1 m2 =
    Helper.union m1 m2;


insert =
    Helper.set1;


remove =
    Helper.remove;


insert2 =
    Helper.set2;


insert3 =
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