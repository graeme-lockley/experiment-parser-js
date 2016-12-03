import file:../core/Array as Array;
import file:../core/Maybe as Maybe;
import file:../core/Record as Record;
import file:../core/Result as Result;
import file:../core/String as String;
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


mergeState stateA stateB =
    Tuple.Tuple (Tuple.first stateB) (Record.union (Tuple.second stateA) (Tuple.second stateB));


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

newBoundTypeVariable name state =
    let {
        newName =
            nextNames (Tuple.first state);

        newVariableType =
            variableType (nameOf newName)
    } in
        Tuple.Tuple newVariableType (Tuple.Tuple newName (Record.set1 name newVariableType (Tuple.second state)));


resolveBinding type context =
    if type.type == "VARIABLE" then
        if Record.get type.name context then
            resolveBinding (Record.get type.name context) context
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

    else if ast.type == "APPLY" then
        let {
            typeVariable =
                newTypeVariable state;

            typeVariableName =
                Tuple.first typeVariable;

            typeVariableState =
                Tuple.second typeVariable
        } in
            Result.andThen (infer typeVariableState ast.operation) (\operation ->
                Result.andThen (infer (mergeContext typeVariableState (contextFromInferResult operation)) ast.operand) (\operand ->
                    Result.andThen (unify (resolveBinding (typeFromInferResult operation) (contextFromInferResult operand)) (functionType (typeFromInferResult operand) typeVariableName)) (\unifyResult ->
                        mkInferResult
                            (mergeContext (mergeState (stateFromInferResult operation) (stateFromInferResult operand)) unifyResult)
                            (resolveBinding typeVariableName unifyResult)
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
                    Maybe.withDefault () (findBinding ast.name state);

                inferExpressionResult =
                    infer state ast.expression
            } in
                Result.andThen inferExpressionResult (\unwrappedTypedExpressionState ->
                    Result.andThen (unify typeVariable (typeFromInferResult unwrappedTypedExpressionState)) (\unifiedSchema ->
                        mkInferResult (addBinding ast.name (resolveBinding (typeFromInferResult unwrappedTypedExpressionState) (contextFromInferResult unwrappedTypedExpressionState)) (stateFromInferResult unwrappedTypedExpressionState)) typeUnit
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
            bindingResult = Maybe.map (\type -> mkInferResult state type) bindingType
        } in
            Maybe.withDefault (Result.Error ("Unknown identifier " ++ ast.name)) bindingResult

    else if ast.type == "LAMBDA" then
        let {
            typeVariable =
                newTypeVariable state;

            typeVariableName =
                Tuple.first typeVariable;

            typeVariableState =
                Tuple.second typeVariable;

            newState =
                addBinding ast.variable typeVariableName typeVariableState
        } in
            Result.andThen (infer newState ast.expression) (\expression ->
                mkInferResult
                    (stateFromInferResult expression)
                    (resolveBinding (functionType typeVariableName (typeFromInferResult expression)) (stateFromInferResult expression))
            )

    else if ast.type == "MODULE" then
        let {
            initialState =
                Array.foldl (\state \declaration -> Tuple.second (newBoundTypeVariable declaration.name state)) state ast.declarations;

            startResult =
                mkInferResult initialState typeUnit;

            expressionFoldFunction currentResult declaration =
                Result.andThen currentResult (\resultState -> infer (Tuple.first resultState) declaration);

            typedDeclarations =
                Array.foldl expressionFoldFunction startResult ast.declarations;

            typedExpression =
                expressionFoldFunction typedDeclarations ast.expression
        } in
            Result.andThen typedExpression (\expression ->
                mkInferResult (mkState names context) (Record.set1 "_$EXPR" (Tuple.second expression) (
                    Array.foldl
                        (\result \declaration -> Record.set1 declaration.name (resolveBinding (Record.get declaration.name context) typeDeclarationsContext) result)
                        (Record.mk0 ()) ast.declarations))
                    where {
                        names =
                            namesFromInferResult expression;

                        context =
                            contextFromInferResult expression;

                        typeDeclarationsContext =
                            contextFromInferResult (Result.withDefault () typedDeclarations)
                    }
            )

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
    DEBUG.eq (unify (functionType (variableType "a") typeInteger) (functionType typeString (variableType "b"))) (Result.Ok (Record.mk2 "b" typeInteger "a" typeString))
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

namesFromInferResult inferResult =
    namesFromState (stateFromInferResult inferResult);

updateNamesInInferResult names inferResult =
    mkInferResult (mkState names (stateFromInferResult)) (typeFromInferResult);


showType type =
    Tuple.first (showNamedType type (Tuple.Tuple initNames (Record.mk0 ())))
assumptions {
    DEBUG.eq (showType typeString) "String";
    DEBUG.eq (showType (functionType typeString typeInteger)) "String -> Integer";
    DEBUG.eq (showType (functionType (functionType (variableType "a") (variableType "b")) typeCharacter)) "(a1 -> a2) -> Character";
    DEBUG.eq (showType (functionType (variableType "a") (functionType (variableType "b") typeCharacter))) "a1 -> a2 -> Character"
};


showNamedType type state =
    if type.type == "CONSTANT" then
        Tuple.Tuple type.name state

    else if type.type == "VARIABLE" then
        if Record.get type.name (Tuple.second state) then
            Tuple.Tuple (Record.get type.name (Tuple.second state)) state
        else
            (Tuple.Tuple typeName newState
                where {
                    newName =
                        nextNames (Tuple.first state);

                    typeName =
                        nameOf newName;

                    newContext =
                        Record.set1 type.name typeName (Tuple.second state);

                    newState =
                        Tuple.Tuple newName newContext

                })

    else if type.type == "FUNCTION" then
        let {
            showNamedTypeDomain =
                showNamedType type.domain state;

            prettyPrintDomain =
                if (Record.get "type" type.domain) == "FUNCTION" then
                        "(" ++ (Tuple.first showNamedTypeDomain) ++ ")"
                    else
                        Tuple.first showNamedTypeDomain;

            showNamedTypeRange =
                showNamedType type.range (Tuple.second showNamedTypeDomain);

            prettyPrintRange =
                Tuple.first showNamedTypeRange
        } in
            Tuple.Tuple (prettyPrintDomain ++ " -> " ++ prettyPrintRange) (Tuple.second showNamedTypeRange)
    else
        Tuple.Tuple "-unknown-" state;


showModuleType moduleType =
    String.trim (Record.fold (\acc \key \value -> acc ++ key ++ " : " ++ (showType value) ++ "\n") "" moduleType);