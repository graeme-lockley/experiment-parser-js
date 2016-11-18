import file:../core/Array as Array;
import file:../core/Maybe as Maybe;
import file:../core/Record as Record;
import file:../core/Result as Result;
import file:../core/Tuple as Tuple;

import file:../core/Debug as DEBUG;


constantType name =
    Record.mk2
        "type" "CONSTANT"
        "name" name;

variableType name =
    Record.mk2
        "type" "VARIABLE"
        "name" name;

functionType domain range =
    Record.mk3
        "type" "FUNCTION"
        "domain" domain
        "range" range;


typeBoolean = constantType "Boolean";


typeCharacter = constantType "Character";


typeInteger = constantType "Integer";


typeString = constantType "String";


typeUnit = constantType "Unit";


initSubstitution =
    Record.mk0 ();


extend typeEnvironment variable schema =
    Record.set1
        variable schema
        typeEnvironment;


initNames =
    0;


nextNames names =
    names + 1;


nameOf names =
    "a" + names;


addBinding name type state =
    Tuple.Tuple (Tuple.first state) (Record.set1 name type (Tuple.second state));


mergeContext state context =
    Tuple.Tuple (Tuple.first state) (Record.union (Tuple.second state) context);


findBinding name state =
    let {
        bindingValue = Record.get name (Tuple.second state)
    } in
        if bindingValue then
            Maybe.Just bindingValue
        else
            Maybe.Nothing;


newTypeVariable state =
    let {
        newName = nextNames (Tuple.first state)
    } in
        Tuple.Tuple (variableType (nameOf newName)) (Tuple.Tuple newName (Tuple.second state));


resolveBinding type context =
    if type.type == "VARIABLE" then
        if Record.get type.name context then
            Record.get type.name context
        else
            type
    else if type.type == "FUNCTION" then
        functionType (resolveBinding type.domain context) (resolveBinding type.range context)
    else
        type
assumptions {
    DEBUG.eq (resolveBinding (variableType "a") (Record.mk1 "a" typeString)) typeString;
    DEBUG.eq (resolveBinding (functionType (variableType "a") typeInteger) (Record.mk1 "a" typeString)) (functionType typeString typeInteger)
};


infer state ast =
    if ast.type == "ADDITION" then
        Result.andThen (infer state ast.left) (\unwrappedLeftOperand ->
            Result.andThen (infer (Tuple.first unwrappedLeftOperand) ast.right) (\unwrappedRightOperand ->
                Result.andThen (unify (Tuple.second unwrappedLeftOperand) typeInteger) (\leftSchema ->
                    Result.andThen (unify (Tuple.second unwrappedRightOperand) typeInteger) (\rightSchema ->
                        mkInferResult inferredState typeInteger
                            where {
                                inferredState =
                                    mergeContext (mergeContext (Tuple.first unwrappedRightOperand) leftSchema) rightSchema
                            }
                    )
                )
            )
        )

    else if ast.type == "CONSTANT_BOOLEAN" then
        mkInferResult state typeBoolean

    else if ast.type == "CONSTANT_CHARACTER" then
        mkInferResult state typeCharacter

    else if ast.type == "CONSTANT_INTEGER" then
        mkInferResult state typeInteger

    else if ast.type == "CONSTANT_STRING" then
        mkInferResult state typeString

    else if ast.type == "DECLARATION" then
        if (Record.get "type" (Record.get "expression" ast)) == "LAMBDA" then
            let {
                typeVariable =
                    newTypeVariable state;

                typeVariableName =
                    Tuple.first typeVariable;

                typeVariableState =
                    Tuple.second typeVariable;

                typeVariableInState =
                    addBinding ast.name typeVariableName typeVariableState;

                inferExpressionResult =
                    infer typeVariableInState ast.expression
            } in
                Result.andThen inferExpressionResult (\unwrappedTypedExpressionState ->
                    Result.andThen (unify typeVariableName (typeFromInferResult unwrappedTypedExpressionState)) (\unifiedSchema ->
                        mkInferResult (addBinding ast.name (resolveBinding (typeFromInferResult unwrappedTypedExpressionState) (contextFromInferResult unwrappedTypedExpressionState)) state) typeUnit
                    )
                )
        else
            let {
                typedExpressionState =
                    infer state ast.expression;

                resultState =
                    Result.map (\r -> addBinding ast.name (Tuple.second r) (Tuple.first r)) typedExpressionState
            } in
                Result.map (\r -> Tuple.Tuple r typeUnit) resultState

    else if ast.type == "IDENTIFIER" then
        let {
            bindingType = findBinding ast.name state;
            bindingResult = Maybe.map (\type -> Result.Ok (Tuple.Tuple state type)) bindingType
        } in
            Maybe.withDefault (Result.Error ("Unknown identifier " ++ ast.name)) bindingResult

    else if ast.type == "LAMBDA" then
        Result.andThen inferExpression (\unwrappedInferExpression ->
            Result.Ok (Tuple.Tuple (Tuple.first unwrappedInferExpression) lambdaType)
                where {
                    lambdaType = resolveBinding (functionType lambdaParametersType (Tuple.second unwrappedInferExpression)) (Tuple.second (Tuple.first unwrappedInferExpression))
                }
        )
        where {
            nameFoldFunction s item =
                let {
                    typeVariable = newTypeVariable (Tuple.second s);
                    typeVariableName = Tuple.first typeVariable;
                    typeVariableInState = addBinding item typeVariableName (Tuple.second typeVariable)
                } in
                    Tuple.Tuple (Array.append typeVariableName (Tuple.first s)) typeVariableInState;

            namesState =
                Array.foldl nameFoldFunction (Tuple.Tuple Array.empty state) ast.variables;

            names =
                Tuple.first namesState;

            lambdaParametersType =
                Array.foldl (\a \i -> functionType a i) (Maybe.withDefault typeUnit (Array.at 0 names)) (Array.slice 1 names);

            inferExpression = infer (Tuple.second namesState) ast.expression
        }

    else if ast.type == "MODULE" then
        let {
            startResult =
                mkInferResult state typeUnit;

            expressionFoldFunction currentResult declaration =
                Result.andThen currentResult (\resultState -> infer (Tuple.first resultState) declaration);

            typedDeclarations =
                Array.foldl expressionFoldFunction startResult ast.declarations;

            typedExpression =
                expressionFoldFunction typedDeclarations ast.expression
        } in
            typedExpression

    else
        mkInferResult state typeUnit;


unify a b =
    if a.type == "VARIABLE" && b.type == "CONSTANT" then
        Result.Ok (Record.mk1 a.name b)
    else if a.type == "VARIABLE" && b.type == "VARIABLE" then
        if a.name == b.name then
            Result.Ok (Record.mk0 ())
        else
            Result.Ok (Record.mk1 a.name b)
    else if a.type == "VARIABLE" && b.type == "FUNCTION" then
        Result.Ok (Record.mk1 a.name b)
    else if a.type == "CONSTANT" && b.type == "VARIABLE" then
        Result.Ok (Record.mk1 b.name a)
    else if a.type == "CONSTANT" && b.type == "CONSTANT" then
        if a.name == b.name then
            Result.Ok (Record.mk0 ())
        else
            Result.Error ("Unable to unify " ++ a.name ++ " and " ++ b.name)
    else if a.type == "FUNCTION" && b.type == "FUNCTION" then
        Result.andThen (unify a.domain b.domain) (\domainSchema ->
            Result.andThen (unify (resolveBinding a.range domainSchema) (resolveBinding b.range domainSchema)) (\rangeSchema ->
                Result.Ok (Record.union domainSchema rangeSchema)
            )
        )
    else
        Result.Error ("Unable to unify " ++ a ++ " and " ++ b)
assumptions {
    DEBUG.eq (unify typeBoolean typeCharacter) (Result.Error "Unable to unify Boolean and Character");
    DEBUG.eq (unify (variableType "a") typeCharacter) (Result.Ok (Record.mk1 "a" typeCharacter));
    DEBUG.eq (unify typeInteger (variableType "a")) (Result.Ok (Record.mk1 "a" typeInteger));
    DEBUG.eq (unify (variableType "b") (variableType "a")) (Result.Ok (Record.mk1 "b" (variableType "a")));
    DEBUG.eq (unify (variableType "a") (functionType typeInteger typeInteger)) (Result.Ok (Record.mk1 "a" (functionType typeInteger typeInteger)));
    DEBUG.eq (unify (functionType (variableType "a") typeInteger) (functionType typeString (variableType "b"))) (Result.Ok (Record.mk2 "a" typeString "b" typeInteger))
};


typeCheckAST ast =
    infer (Tuple.Tuple initNames initSubstitution) ast;


mkState names context =
    Tuple.Tuple names context;

contextFromState state =
    Tuple.second state;

namesFromState state =
    Tuple.first state;


mkInferResult state type =
    Result.Ok (Tuple.Tuple state type);

typeFromInferResult inferResult =
    Tuple.second inferResult;

stateFromInferResult inferResult =
    Tuple.first inferResult;

contextFromInferResult inferResult =
    contextFromState (stateFromInferResult inferResult);