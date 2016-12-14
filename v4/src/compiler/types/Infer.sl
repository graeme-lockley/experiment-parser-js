import file:./Rails as R;
import file:./Schema as Schema;
import file:./Subst as Subst;
import file:./SubstitutableType as SubstitutableType;
import file:./Type as Type;
import file:./TypeEnv as TypeEnv;

import file:../../core/Array as List;
import file:../../core/Maybe as Maybe;
import file:../../core/Record as Record;
import file:../../core/Result as Result;
import file:../../core/Tuple as Tuple;

import file:../../core/Debug as DEBUG;


mkState typeEnv constraints names =
    Record.mk3
        "typeEnv" typeEnv
        "constraints" constraints
        "names" names;


initialState =
    mkState TypeEnv.empty List.empty 0;


fresh inferState =
    Result.Ok (Tuple.Tuple name (Record.set1 "names" nextNameState inferState))
        where {
            nextNameState =
                inferState.names + 1;

            name =
                "a" ++ nextNameState
        };


uni t1 t2 inferState =
    Result.Ok (Record.set1 "constraints" (List.append (Tuple.Tuple t1 t2) inferState.constraints) inferState);


inEnv name schema inferState =
    Result.Ok (Record.set1 "typeEnv" (TypeEnv.extend name schema inferState.typeEnv) inferState);


lookupEnv name inferState =
    Maybe.withDefault
        (Result.Error ("Unknown identifier " ++ name))
        (Maybe.map (\v -> instantiate v inferState) (TypeEnv.find name inferState.typeEnv));


instantiate schema inferState =
    let {
        substInferState =
            List.foldl (\state \name ->
                Result.andThen (fresh (Tuple.second state)) (\nameInferState ->
                Tuple.Tuple
                    (Subst.add name (Type.TVar (Tuple.first nameInferState)) (Tuple.first state))
                    (Tuple.second nameInferState)
                )
            ) (Result.Ok (Tuple.Tuple Subst.nullSubst inferState)) (Schema.names schema)
    } in
        Result.andThen substInferState (\s ->
            mkInferResult
                (SubstitutableType.apply (Tuple.first s) (Schema.type schema))
                (Tuple.second s)
        );


inferO expr inferState =
    if expr.type == "ADDITION" then
        Result.andThen (infer expr.left inferState) (\t1 ->
        Result.andThen (infer expr.right (Tuple.second t1)) (\t2 ->
        Result.andThen (fresh (Tuple.second t2)) (\tv ->
        Result.andThen (uni (Type.TArr (Tuple.first t1) (Type.TArr (Tuple.first t2) (Type.TVar (Tuple.first tv)))) (Type.TArr Type.typeInteger (Type.TArr Type.typeInteger Type.typeInteger)) (Tuple.second tv)) (\u1 ->
            mkInferResult (Type.TVar (Tuple.first tv)) u1
        ))))

    else if expr.type == "APPLY" then
        Result.andThen (infer expr.operation inferState) (\t1 ->
        Result.andThen (infer expr.operand (Tuple.second t1)) (\t2 ->
        Result.andThen (fresh (Tuple.second t2)) (\tv ->
        Result.andThen (uni (Tuple.first t1) (Type.TArr (Tuple.first t2) (Type.TVar (Tuple.first tv))) (Tuple.second tv)) (\ur ->
            mkInferResult (Type.TVar (Tuple.first tv)) ur
        ))))

    else if expr.type == "DECLARATION" then
        Result.andThen (infer expr.expression inferState) (\inferExpression ->
        Result.andThen (lookupEnv expr.name (Tuple.second inferExpression)) (\t ->
        Result.andThen (uni (Tuple.first t) (Tuple.first inferExpression) (Tuple.second t)) (\t2 ->
            mkInferResult (Tuple.first inferExpression) t2
        )))

    else if expr.type == "IDENTIFIER" then
        lookupEnv expr.name inferState

    else if expr.type == "MODULE" then
        Result.andThen (List.foldl (\currentState \declaration ->
            Result.andThen currentState (\state ->
                Result.andThen (fresh (Tuple.second state)) (\tv ->
                Result.andThen (inEnv declaration.name (Schema.Forall List.empty (Type.TVar (Tuple.first tv))) (Tuple.second tv)) (\t ->
                    mkInferResult Type.typeUnit t
                )))) (mkInferResult Type.typeUnit inferState) expr.declarations) (\initDeclarations ->
        Result.andThen (List.foldl (\currentState \declaration -> Result.andThen currentState (\state -> infer declaration (Tuple.second state))) (mkInferResult Type.typeUnit (Tuple.second initDeclarations)) expr.declarations) (\inferDeclarations ->
        Result.andThen (fresh (Tuple.second inferDeclarations)) (\tv ->
        Result.andThen (infer expr.expression (Tuple.second tv)) (\inferExpression ->
            Result.Ok inferExpression
        ))))

    else if expr.type == "LAMBDA" then
        Result.andThen (fresh inferState) (\tv ->
        Result.andThen (inEnv expr.variable (Schema.Forall List.empty (Type.TVar (Tuple.first tv))) (Tuple.second tv)) (\t ->
        Result.andThen (infer expr.expression t) (\inferExpression ->
            mkInferResult (Type.TArr (Type.TVar (Tuple.first tv)) (Tuple.first inferExpression)) (Tuple.second inferExpression)
        )))

    else
        Result.Error ("No inference for " ++ expr.type);


inferN expr =
    if expr.type == "CONSTANT_BOOLEAN" then
        R.returns Type.typeBoolean

    else if expr.type == "CONSTANT_CHARACTER" then
        R.returns Type.typeCharacter

    else if expr.type == "CONSTANT_INTEGER" then
        R.returns Type.typeInteger

    else if expr.type == "CONSTANT_STRING" then
        R.returns Type.typeString

    else if expr.type == "CONSTANT_UNIT" then
        R.returns Type.typeUnit

    else
        (\result -> Result.andThen result (\state -> inferO expr (Tuple.second state)));


infer expr inferState =
    inferN expr (mkInferResult () inferState);

mkInferResult type inferState =
    Result.Ok (Tuple.Tuple type inferState);