import file:../../core/Array as List;
import file:../../core/Maybe as Maybe;
import file:../../core/Record as Record;
import file:../../core/Result as Result;
import file:../../core/Tuple as Tuple;

import file:../../core/Debug as DEBUG;


get name state =
    Result.andThen state (\stateValue ->
        let {
            value = Record.get name (Tuple.second stateValue)
        } in
            if value == 0 || value then
                mkOkState value (Tuple.second stateValue)
            else
                Result.Error ("Unknown record field " ++ name))
assumptions {
    DEBUG.eq (get "bob" (mkOkState () (Record.mk1 "bob" 123))) (mkOkState 123 (Record.mk1 "bob" 123));
    DEBUG.eq (get "bobs" (mkOkState () (Record.mk1 "bob" 123))) (Result.Error "Unknown record field bobs")
};


set name value state =
    Result.andThen state (\stateValue ->
        Result.Ok (Tuple.Tuple value (Record.set1 name value (Tuple.second stateValue))))
assumptions {
    DEBUG.eq (set "bob" 456 (mkOkState () (Record.mk1 "bob" 123))) (mkOkState 456 (Record.mk1 "bob" 456));
    DEBUG.eq (set "bobs" 456 (mkOkState () (Record.mk1 "bob" 123))) (mkOkState 456 (Record.mk2 "bob" 123 "bobs" 456))
};


returns value state =
    Result.andThen state (\stateValue ->
        Result.Ok (Tuple.Tuple value (Tuple.second stateValue)))
assumptions {
    DEBUG.eq (returns 456 (mkOkState () (Record.mk1 "bob" 123))) (mkOkState 456 (Record.mk1 "bob" 123))
};


error message state =
    Result.andThen state (\stateValue ->
        Result.Error message);


log message f2 state =
    Result.andThen (DEBUG.log message state) (\_ -> f2 state);

bind f1 f2 state =
    let {
        v1 = f1 state
    } in
        Result.andThen v1 (\v1Result -> f2 (Tuple.first v1Result) v1)
assumptions {
    DEBUG.eq
        ((bind (get "bob") (\bobValue -> returns (bobValue + 1))) (mkOkState () (Record.mk1 "bob" 123)))
        (mkOkState 124 (Record.mk1 "bob" 123));
    DEBUG.eq
        (bind (set "a" 1) (\a -> get "a") (mkOkState () (Record.mk0 ())))
        (mkOkState 1 (Record.mk1 "a" 1));
    DEBUG.eq
        (bind (set "a" 1) (\a ->
         bind (set "a" (a + 1)) (\a ->
            returns (a * 2))) (mkOkState () (Record.mk0 ())))
        (mkOkState 4 (Record.mk1 "a" 2));
    DEBUG.eq
        (bind (set "a" 1) (\a ->
         bind (set "a" (a + 1)) (\a ->
         bind (set "b" 10) (\b ->
            returns (a + b)))) (mkOkState () (Record.mk0 ())))
        (mkOkState 12 (Record.mk2 "a" 2 "b" 10))
};


map f =
    bind value (\list \state ->
        List.foldl
            (\acc \item ->
                (bind value (\accList ->
                 bind (returns item) (\_ ->
                 bind f (\fResult ->
                    returns (List.append fResult accList))))) acc)
            (returns List.empty state)
            list
    )
assumptions {
    DEBUG.eq (map (bind value (\n -> returns (n + 1))) (mkOkState (List.mk3 1 2 3) 0)) (mkOkState (List.mk3 2 3 4) 0)
};


foldl f list accumulator =
    if List.isEmpty list then
        accumulator
    else
        foldl f (tail list) (f (head list) accumulator)
            where {
                head x =
                    Maybe.withDefault () (List.at 0 x);

                tail x =
                    List.slice 1 x
            }
assumptions {
    DEBUG.eq
        (foldl (\v -> bind value (\acc -> returns (acc + v))) (List.mk3 1 2 3) (mkOkState 0 99))
        (mkOkState 6 99)
};


value state =
    state
assumptions {
    DEBUG.eq (value (mkOkState 123 1)) (mkOkState 123 1)
};


mkOkState value body =
    Result.Ok (Tuple.Tuple value body);
