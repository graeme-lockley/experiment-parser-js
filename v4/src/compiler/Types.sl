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


findBinding name state =
    let {
        bindingValue = Record.get name (Tuple.second state)
    } in
        if bindingValue then
            Maybe.Just bindingValue
        else
            Maybe.Nothing;


infer state ast =
    if ast.type == "CONSTANT_BOOLEAN" then
        Result.Ok (Tuple.Tuple state typeBoolean)

    else if ast.type == "CONSTANT_CHARACTER" then
        Result.Ok (Tuple.Tuple state typeCharacter)

    else if ast.type == "CONSTANT_INTEGER" then
        Result.Ok (Tuple.Tuple state typeInteger)

    else if ast.type == "CONSTANT_STRING" then
        Result.Ok (Tuple.Tuple state typeString)

    else if ast.type == "DECLARATION" then
        if (Record.get "type" (Record.get "expression" ast)) == "LAMBDA" then
            Result.Ok (Tuple.Tuple state typeUnit)
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

    else if ast.type == "MODULE" then
        let {
            startResult =
                Result.Ok (Tuple.Tuple state typeUnit);

            expressionFoldFunction currentResult declaration =
                Result.andThen currentResult (\resultState -> infer (Tuple.first resultState) declaration);

            typedDeclarations =
                Array.foldl expressionFoldFunction startResult ast.declarations;

            typedExpression =
                expressionFoldFunction typedDeclarations ast.expression
        } in
            typedExpression

    else
        Result.Ok (Tuple.Tuple state typeUnit);



typeCheckAST ast =
    infer (Tuple.Tuple initNames initSubstitution) ast;
