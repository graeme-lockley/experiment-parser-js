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


infer state ast =
    if ast.type == "CONSTANT_BOOLEAN" then
        Result.Ok (Tuple.Tuple state (Record.set1 "inferred_type" typeBoolean ast))

    else if ast.type == "CONSTANT_CHARACTER" then
        Result.Ok (Tuple.Tuple state (Record.set1 "inferred_type" typeCharacter ast))

    else if ast.type == "CONSTANT_INTEGER" then
        Result.Ok (Tuple.Tuple state (Record.set1 "inferred_type" typeInteger ast))

    else if ast.type == "CONSTANT_STRING" then
        Result.Ok (Tuple.Tuple state (Record.set1 "inferred_type" typeString ast))

    else if ast.type == "DECLARATION" then
        if (Record.get "type" (Record.get "expression" ast)) == "LAMBDA" then
            Result.Ok (Tuple.Tuple state ast)
        else
            let {
                typedExpressionState = infer state ast.expression
            } in
                Result.Ok (Tuple.Tuple state ast)

    else if ast.type == "MODULE" then
        let {
            startResult =
                Result.Ok (Tuple.Tuple state ast);

            expressionFoldFunction currentResult declaration =
                Result.andThen currentResult (\resultState -> infer (Tuple.first resultState) declaration);

            typedDeclarations =
                Array.foldl expressionFoldFunction startResult ast.declarations;

            typedOptionalExpression =
                if Maybe.isJust ast.optionalExpression then
                    Result.map (\r -> Tuple.Tuple (Tuple.first r) (Maybe.Just (Tuple.second r))) (expressionFoldFunction typedDeclarations (Maybe.withDefault () ast.optionalExpression))
                else
                    Result.Ok (Maybe.Nothing)
        } in
            Result.map (\tuple -> Tuple.Tuple (Tuple.first tuple) (Record.set1 "optionalExpression" (Tuple.second tuple) ast)) typedOptionalExpression

    else
        Result.Ok (Tuple.Tuple state ast);



typeCheckAST ast =
    Result.map (\r -> Tuple.second r) (infer (Tuple.Tuple initNames initSubstitution) ast);
