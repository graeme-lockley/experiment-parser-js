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
        (Result.Error ("Unknown identifier" ++ name))
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


infer expr inferState =
    if expr.type == "CONSTANT_BOOLEAN" then
        mkInferResult Type.typeBoolean inferState

    else if expr.type == "CONSTANT_CHARACTER" then
        mkInferResult Type.typeCharacter inferState

    else if expr.type == "CONSTANT_INTEGER" then
        mkInferResult Type.typeInteger inferState

    else if expr.type == "CONSTANT_STRING" then
        mkInferResult Type.typeString inferState

    else if expr.type == "DECLARATION" then
        Result.andThen (fresh inferState) (\tv ->
        Result.andThen (infer expr.expression (Tuple.second tv)) (\inferExpression ->
        Result.andThen (inEnv expr.name (Schema.Forall List.empty (Type.TVar (Tuple.first tv))) (Tuple.second inferExpression)) (\t ->
        Result.andThen (uni (Tuple.first tv) (Tuple.first inferExpression) t) (\t2 ->
            mkInferResult (Tuple.first inferExpression) t2
        ))))

    else if expr.type == "IDENTIFIER" then
        lookupEnv expr.name inferState

    else if expr.type == "MODULE" then
        Result.andThen (List.foldl (\currentState \declaration -> Result.andThen currentState (\state -> infer declaration (Tuple.second state))) (mkInferResult Type.typeUnit inferState) expr.declarations) (\inferDeclarations ->
        Result.andThen (fresh (Tuple.second inferDeclarations)) (\tv ->
        Result.andThen (infer expr.expression (Tuple.second tv)) (\inferExpression ->
            Result.Ok  inferExpression
        )))

    else if expr.type == "LAMBDA" then
        Result.andThen (fresh inferState) (\tv ->
        Result.andThen (infer expr.expression (Tuple.second tv)) (\inferExpression ->
        Result.andThen (inEnv expr.variable (Schema.Forall List.empty (Tuple.first tv)) (Tuple.second inferExpression)) (\t ->
            mkInferResult (Type.TArr (Type.TVar (Tuple.first tv)) (Tuple.first t)) (Tuple.second t)
        )))

    else
        Result.Error ("No inference for " ++ expr.type);


mkInferResult type inferState =
    Result.Ok (Tuple.Tuple type inferState);