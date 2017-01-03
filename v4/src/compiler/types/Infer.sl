import file:./Rails as R;
import file:./Schema as Schema;
import file:./Solver as Solver;
import file:./Subst as Subst;
import file:./SubstitutableType as SubstitutableType;
import file:./Type as Type;
import file:./TypeEnv as TypeEnv;

import file:../../core/Array as List;
import file:../../core/Map as Map;
import file:../../core/Maybe as Maybe;
import file:../../core/Record as Record;
import file:../../core/Result as Result;
import file:../../core/Set as Set;
import file:../../core/Tuple as Tuple;

import file:../../core/Debug as DEBUG;


mkState typeEnv constraints names =
    Record.mk3
        "typeEnv" typeEnv
        "constraints" constraints
        "names" names;


initialState =
    mkState TypeEnv.empty List.empty 0;


lookupEnv name =
    R.bind (R.get "typeEnv") (\typeEnv \state ->
        Maybe.withDefault
            (Result.Error ("Unknown identifier " ++ name))
            (Maybe.map (\v -> instantiate v state) (TypeEnv.find name typeEnv))
    );


instantiate schema =
    R.bind (R.returns (Schema.names schema)) (\_ ->
    R.bind (R.map (R.bind R.value (\_ -> fresh))) (\asp ->
        R.returns (SubstitutableType.apply s (Schema.type schema))
            where {
                s =
                    Map.fromList (List.zip (Schema.names schema) asp)
            }
    ))
assumptions {
    DEBUG.eq (instantiate (Schema.Forall List.empty (Type.TVar "x")) (mkInferResult 0 (mkState TypeEnv.empty List.empty 10))) (mkInferResult (Type.TVar "x") (mkState TypeEnv.empty List.empty 10));
    DEBUG.eq (instantiate (Schema.Forall (List.mk1 "a1") (Type.TVar "a1")) (mkInferResult 0 (mkState TypeEnv.empty List.empty 10))) (mkInferResult (Type.TVar "a11") (mkState TypeEnv.empty List.empty 11))
};


generalize typeEnv type =
    Schema.Forall names type
        where {
            names =
                Set.toList (Set.difference (Type.ftv type) (TypeEnv.ftv typeEnv))
        }
    assumptions {
        DEBUG.eq (generalize TypeEnv.empty (Type.TVar "x")) (Schema.Forall (List.mk1 "x") (Type.TVar "x"))
    };


resolveExpression expr =
    R.bind (inferN expr) (\inferResult ->
    R.bind (R.get "constraints") (\constraints \state ->
        Result.andThen (Solver.unify constraints) (\unifyResult ->
            R.returns resolvedSchemaWithExpr state
                where {
                    resolveExpr type unifyResult =
                        Schema.resolve (Schema.Forall List.empty type) unifyResult;

                    resolvedSchemaWithExpr =
                        resolveExpr inferResult unifyResult
                }
        )
    ));


inferN expr =
    if expr.type == "APPLY" then
        R.bind (inferN expr.operation) (\t1 ->
        R.bind (inferN expr.operand) (\t2 ->
        R.bind fresh (\tv ->
        R.bind (uni t1 (Type.TArr t2 tv)) (\_ ->
            R.returns tv
        ))))

    else if expr.type == "ADDITION" then
        inferBinaryOperator expr (Type.TArr Type.typeInteger (Type.TArr Type.typeInteger Type.typeInteger))

    else if expr.type == "BOOLEAN_AND" then
        inferBinaryOperator expr (Type.TArr Type.typeBoolean (Type.TArr Type.typeBoolean Type.typeBoolean))

    else if expr.type == "BOOLEAN_NOT" then
        R.bind (inferN expr.operand) (\t1 ->
        R.bind fresh (\tv ->
        R.bind (uni (Type.TArr t1 tv) (Type.TArr Type.typeBoolean Type.typeBoolean)) (\_ ->
            R.returns tv
        )))

    else if expr.type == "BOOLEAN_OR" then
        inferBinaryOperator expr (Type.TArr Type.typeBoolean (Type.TArr Type.typeBoolean Type.typeBoolean))

    else if expr.type == "COMPOSITION" then
        R.bind (inferN expr.left) (\t1 ->
        R.bind (inferN expr.right) (\t2 ->
        R.bind fresh (\tv1 ->
        R.bind fresh (\tv2 ->
        R.bind fresh (\tv3 ->
        R.bind (uni t1 (Type.TArr tv1 tv2)) (\_ ->
        R.bind (uni t2 (Type.TArr tv3 tv1)) (\_ ->
            R.returns (Type.TArr tv3 tv2)
        )))))))

    else if expr.type == "CONSTANT_BOOLEAN" then
        R.returns Type.typeBoolean

    else if expr.type == "CONSTANT_CHARACTER" then
        R.returns Type.typeCharacter

    else if expr.type == "CONSTANT_INTEGER" then
        R.returns Type.typeInteger

    else if expr.type == "CONSTANT_STRING" then
        R.returns Type.typeString

    else if expr.type == "CONSTANT_UNIT" then
        R.returns Type.typeUnit

    else if expr.type == "DECLARATION" then
        R.bind (R.get "typeEnv") (\typeEnv ->
        R.bind (resolveExpression expr.expression) (\expressionSchema ->
        R.bind (inEnv expr.name expressionSchema) (\_ ->
            R.returns expressionSchema
        )))

    else if expr.type == "DIVISION" then
        inferBinaryOperator expr (Type.TArr Type.typeInteger (Type.TArr Type.typeInteger Type.typeInteger))

    else if expr.type == "EQUAL" then
        inferRelationalOperator expr

    else if expr.type == "GREATER_THAN" then
        inferRelationalOperator expr

    else if expr.type == "GREATER_THAN_EQUAL" then
        inferRelationalOperator expr

    else if expr.type == "EXPRESSIONS" then
        R.foldl (\expression -> inferN expression) expr.expressions

    else if expr.type == "IDENTIFIER" then
        lookupEnv expr.name

    else if expr.type == "IF" then
        R.bind (inferN expr.ifExpr) (\e1 ->
        R.bind (inferN expr.thenExpr) (\e2 ->
        R.bind (inferN expr.elseExpr) (\e3 ->
        R.bind (uni e1 Type.typeBoolean) (\_ ->
        R.bind (uni e2 e3) (\_ ->
            R.returns e3
        )))))

    else if expr.type == "LAMBDA" then
        R.bind fresh (\tv ->
        R.bind (inEnv expr.variable (Schema.Forall List.empty tv)) (\_ ->
        R.bind (inferN expr.expression) (\t ->
        R.bind (outEnv expr.variable) (\_ ->
            R.returns (Type.TArr tv t)
        ))))

    else if expr.type == "LESS_THAN" then
        inferRelationalOperator expr

    else if expr.type == "LESS_THAN_EQUAL" then
        inferRelationalOperator expr

    else if expr.type == "MODULE" then
        R.bind (R.foldl (\declaration -> inferN declaration) expr.declarations) (\_ ->
        R.bind fresh (\tv ->
        R.bind (inferN expr.expression) (\te ->
            R.returns te
        )))

    else if expr.type == "MULTIPLICATION" then
        inferBinaryOperator expr (Type.TArr Type.typeInteger (Type.TArr Type.typeInteger Type.typeInteger))

    else if expr.type == "NOT_EQUAL" then
        inferRelationalOperator expr

    else if expr.type == "SCOPE" then
        R.bind openScope (\scope ->
        R.bind (R.foldl (\declaration -> inferN declaration) expr.declarations) (\_ ->
        R.bind fresh (\tv ->
        R.bind (inferN expr.expression) (\te ->
        R.bind (closeScope scope) (\_ ->
            R.returns te
        )))))

    else if expr.type == "STRING_CONCAT" then
        inferBinaryOperator expr (Type.TArr Type.typeString (Type.TArr Type.typeString Type.typeString))

    else if expr.type == "SUBTRACTION" then
        inferBinaryOperator expr (Type.TArr Type.typeInteger (Type.TArr Type.typeInteger Type.typeInteger))

    else if expr.type == "UNARY_PLUS" then
        R.bind (inferN expr.operand) (\t1 ->
        R.bind (uni t1 Type.typeInteger) (\_ ->
            R.returns Type.typeInteger
        ))

    else if expr.type == "UNARY_NEGATE" then
        R.bind (inferN expr.operand) (\t1 ->
        R.bind (uni t1 Type.typeInteger) (\_ ->
            R.returns Type.typeInteger
        ))

    else
        \_ -> Result.Error ("No inference for " ++ expr.type);


inferBinaryOperator expr type =
    R.bind (inferN expr.left) (\t1 ->
    R.bind (inferN expr.right) (\t2 ->
    R.bind fresh (\tv ->
    R.bind (uni (Type.TArr t1 (Type.TArr t2 tv)) type) (\_ ->
        R.returns tv
    ))));


inferRelationalOperator expr =
    R.bind (inferN expr.left) (\t1 ->
    R.bind (inferN expr.right) (\t2 ->
    R.bind (uni t1 t2) (\_ ->
        R.returns Type.typeBoolean
    )));


fresh =
    R.bind (R.get "names") (\names ->
    R.bind (R.set "names" (names + 1)) (\names ->
        R.returns (Type.TVar ("a" ++ names))
    ))
assumptions {
    DEBUG.eq (fresh (mkInferResult () initialState)) (mkInferResult (Type.TVar "a1") (mkState TypeEnv.empty List.empty 1))
};


inEnv name schema =
    R.bind (R.get "typeEnv") (\typeEnv ->
        R.set "typeEnv" (TypeEnv.extend name schema typeEnv)
    );


outEnv name =
    R.bind (R.get "typeEnv") (\typeEnv ->
        R.set "typeEnv" (TypeEnv.remove name typeEnv)
    );


uni t1 t2 =
    R.bind (R.get "constraints") (\constraints ->
        R.set "constraints" (List.append (Tuple.Tuple t1 t2) constraints)
    );


openScope =
    R.get "typeEnv";


closeScope scope =
    R.set "typeEnv" scope;


infer expr inferState =
    inferN expr (mkInferResult () inferState);


mkInferResult type inferState =
    Result.Ok (Tuple.Tuple type inferState);