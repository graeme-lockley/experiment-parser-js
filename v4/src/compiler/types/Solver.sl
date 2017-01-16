import file:./Subst as Subst;
import file:./SubstitutableType as SubstitutableType;
import file:./Type as Type;

import file:../../core/Array as List;
import file:../../core/Debug as DEBUG;
import file:../../core/Map as Map;
import file:../../core/Maybe as Maybe;
import file:../../core/Object as Object;
import file:../../core/Result as Result;
import file:../../core/Tuple as Tuple;


unifies t1 t2 s =
    if Object.eq t1 t2 then
        returns emptyUnifier s
    else if Type.isTCon t1 && Type.isTCon t2 && t1.name == t2.name && (List.length t1.variables) == (List.length t2.variables) then
        unifyMany t1.variables t2.variables s
    else if Type.isTVar t1 then
        bindType t1.name t2 s
    else if Type.isTVar t2 then
        bindType t2.name t1 s
    else if (Type.isTArr t1) && (Type.isTArr t2) then
        unifyMany (List.mk2 t1.domain t1.range) (List.mk2 t2.domain t2.range) s
    else
        let {
            t1s = Type.show t1;
            t2s = Type.show t2
        } in
            fail ("Unification failed " ++ t1s ++ " and " ++ t2s) s
assumptions {
    DEBUG.eq (unifies Type.typeBoolean Type.typeBoolean (Result.Ok emptyUnifier)) (Result.Ok emptyUnifier);
    DEBUG.eq (unifies Type.typeBoolean (Type.TVar "a") (Result.Ok emptyUnifier)) (Result.Ok (Tuple.Tuple (Map.singleton "a" Type.typeBoolean) List.empty));
    DEBUG.eq
        (unifies (Type.TArr (Type.TVar "a2") (Type.TArr Type.typeInteger (Type.TVar "a3"))) (Type.TArr Type.typeInteger (Type.TArr Type.typeInteger Type.typeInteger)) (Result.Ok emptyUnifier))
        (Result.Ok (Tuple.Tuple (Map.mk2 "a2" Type.typeInteger "a3" Type.typeInteger) List.empty));
    DEBUG.eq
        (unifies (Type.TArr (Type.TVar "a2") (Type.TArr (Type.TCon "List" (List.singleton (Type.TVar "a2"))) (Type.TCon "List" (List.singleton (Type.TVar "a2"))))) (Type.TArr Type.typeInteger (Type.TVar "a3")) (Result.Ok emptyUnifier))
        (Result.Ok (Tuple.Tuple (Map.mk2 "a2" Type.typeInteger "a3" (Type.TArr (Type.TCon "List" (List.singleton Type.typeInteger)) (Type.TCon "List" (List.singleton Type.typeInteger)))) List.empty));
    DEBUG.eq
        (unifies (Type.TCon "List" (List.singleton (Type.TVar "a2"))) (Type.TCon "List" (List.singleton Type.typeInteger)) (Result.Ok emptyUnifier))
        (Result.Ok (Tuple.Tuple (Map.singleton "a2" Type.typeInteger) List.empty))
};


unifyMany m1 m2 s =
    if (List.isEmpty m1) && (List.isEmpty m2) then
        returns emptyUnifier s
    else if !(List.isEmpty m1) && !(List.isEmpty m2) then
        Result.andThen (unifies (head m1) (head m2) s) (\result1 ->
            Result.andThen (unifyMany (List.map (SubstitutableType.apply (Tuple.first result1)) (tail m1)) (List.map (SubstitutableType.apply (Tuple.first result1)) (tail m2)) (Result.Ok result1)) (\result2 ->
                Result.Ok (Tuple.Tuple (Subst.compose (Tuple.first result1) (Tuple.first result2)) (List.concat (Tuple.second result1) (Tuple.second result2)))
            )
        )
    else
        fail ("Unification failed " ++ m1 ++ " and " ++ m2) s;


unify constraints =
    let {
        solve state =
            Result.andThen state (\value ->
                let {
                    su = Tuple.first value;
                    cs = Tuple.second value
                } in
                    if List.isEmpty cs then
                        Result.Ok su
                    else
                        let {
                            t1 = Tuple.first (head cs);
                            t2 = Tuple.second (head cs);
                            cs0 = tail cs
                        } in
                            Result.andThen (unifies t1 t2 (Result.Ok value)) (\result2 ->
                                let {
                                    su1 = Tuple.first result2;
                                    cs1 = Tuple.second result2
                                } in
                                    solve (Result.Ok (Tuple.Tuple (Subst.compose su1 su) (List.concat cs1 (constraintListApply su1 cs0))))
                            )
            )
    } in
        solve (Result.Ok (Tuple.Tuple Subst.nullSubst constraints));


returns v s =
    Result.andThen s (\_ -> Result.Ok v);


fail msg s =
    Result.Error msg;


emptyUnifier =
    Tuple.Tuple Subst.nullSubst List.empty;


bindType name type =
    if Object.eq type (Type.TVar name) then
        returns (Tuple.Tuple Subst.nullSubst List.empty)
    else
        returns (Tuple.Tuple (Subst.add name type Subst.nullSubst) List.empty);


head l = Maybe.withDefault () (List.at 0 l);
tail l = List.slice 1 l;


constraintListApply s cs =
    List.map (\t -> Tuple.Tuple (SubstitutableType.apply s (Tuple.first t)) (SubstitutableType.apply s (Tuple.second t))) cs;