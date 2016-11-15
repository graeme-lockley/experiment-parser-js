import file:../core/Maybe as Maybe;
import file:../core/Record as Record;
import file:../core/Result as Result;

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


extend typeEnvironment variable schema =
    Record.set1
        variable schema
        typeEnvironment;


typeCheckAST ast =
    if ast.type == "CONSTANT_BOOLEAN" then
        Result.Ok (Record.set1 "inferred_type" typeBoolean ast)
    else if ast.type == "CONSTANT_CHARACTER" then
        Result.Ok (Record.set1 "inferred_type" typeCharacter ast)
    else if ast.type == "CONSTANT_INTEGER" then
        Result.Ok (Record.set1 "inferred_type" typeInteger ast)
    else if ast.type == "CONSTANT_STRING" then
        Result.Ok (Record.set1 "inferred_type" typeString ast)
    else if ast.type == "MODULE" then
        let {
            oe =
                if Maybe.isJust ast.optionalExpression then
                    Result.map (\r -> Maybe.Just r) (typeCheckAST (Maybe.withDefault () ast.optionalExpression))
                else
                    Result.Ok Maybe.Nothing
        } in
            Result.map (\optionalExpression ->
                Record.set1 "optionalExpression" optionalExpression ast
            ) oe
    else
        Result.Ok ast;
