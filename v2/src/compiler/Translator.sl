import file:./TranslatorHelper as Helper;

import file:./AST as AST;
import file:../core/Array as Array;
import file:../core/Debug as DEBUG;
import file:../core/Maybe as Maybe;
import file:../core/Record as Record;
import file:../core/String as String;


infixOperators =
    Helper.infixOperators;


encodeString =
    Helper.encodeString;


astToJavascript ast indentation =
    if ast.type == "ADDITION" then
         "(" ++ (astToJavascript ast.left indentation) ++ " + " ++ (astToJavascript ast.right indentation) ++ ")"

    else if ast.type == "APPLY" then
        (astToJavascript (at 0 ast.expressions) indentation) ++
        Array.join "" (Array.map (\x -> "(" ++ (astToJavascript x indentation) ++ ")") (Array.slice 1 ast.expressions))

    else if ast.type == "BOOLEAN_AND" then
        "(" ++ (Array.join " && " (Array.map (\e -> astToJavascript e indentation) ast.expressions)) ++ ")"

    else if ast.type == "BOOLEAN_NOT" then
        "(!" ++ (astToJavascript ast.operand indentation) ++ ")"

    else if ast.type == "BOOLEAN_OR" then
        "(" ++ (Array.join " || " (Array.map (\e -> astToJavascript e indentation) ast.expressions)) ++ ")"

    else if ast.type == "COMPOSITION" then
        (\variableName ->
            "(" ++ variableName ++ " => " ++ (astToJavascript ast.left indentation) ++ "(" ++ (astToJavascript ast.right indentation) ++ "(" ++ variableName ++ ")))"
        ) ("_$" ++ indentation)

    else if ast.type == "CONSTANT_BOOLEAN" then
        if ast.value then
            "true"
        else
            "false"

    else if ast.type == "CONSTANT_CHARACTER" then
        '"' ++ (encodeString ast.value) ++ '"'

    else if ast.type == "CONSTANT_INTEGER" then
        ast.value

    else if ast.type == "CONSTANT_STRING" then
        '"' ++ (encodeString ast.value) ++ '"'

    else if ast.type == "CONSTANT_UNIT" then
        "undefined"

    else if ast.type == "DIVISION" then
        "(" ++ (astToJavascript ast.left indentation) ++ " / " ++ (astToJavascript ast.right indentation) ++ ")"

    else if ast.type == "EQUAL" then
        "(" ++ (astToJavascript ast.left indentation) ++ " == " ++ (astToJavascript ast.right indentation) ++ ")"

    else if ast.type == "DECLARATION" then
        if (Record.get "type" (Record.get "expression" ast)) == "LAMBDA" then
            (spaces indentation) ++ "function " ++ ast.name ++ "(" ++ (at 0 (Record.get "variables" (Record.get "expression" ast))) ++ ") {\n" ++
            (
                if (Array.length (Record.get "variables" (Record.get "expression" ast))) == 1 then
                    "  return " ++ (astToJavascript (Record.get "expression" (Record.get "expression" ast)) (indentation + 1)) ++ ";\n"
                else
                    "  return " ++ (astToJavascript (AST.lambda (Array.slice 1 (Record.get "variables" (Record.get "expression" ast))) (Record.get "expression" (Record.get "expression" ast))) (indentation + 1)) ++ ";\n"
            ) ++ "}"
        else
            (spaces indentation) ++ "const " ++ ast.name ++ " = " ++ (astToJavascript (ast.expression) 0) ++ ";"

    else if (ast.type == "EXPRESSIONS") then
        "(() => {\n" ++ (spaces (indentation + 2)) ++

        Array.join (";\n" ++ (spaces (indentation + 2)))
            ( Array.map (\e -> astToJavascript e (indentation + 2)) (Array.take (Array.length (ast.expressions) - 1) ast.expressions) ) ++
        (
            if (Array.length ast.expressions) > 1 then
                ";\n"
            else
                ""
        ) ++
        (spaces (indentation + 2)) ++ "return " ++ (astToJavascript (at (Array.length ast.expressions - 1) ast.expressions) 0) ++ ";\n" ++
        (spaces (indentation + 1)) ++ "})()"

    else if ast.type == "GREATER_THAN" then
        "(" ++ (astToJavascript ast.left indentation) ++ " > " ++ (astToJavascript ast.right indentation) ++ ")"

    else if ast.type == "GREATER_THAN_EQUAL" then
        "(" ++ (astToJavascript ast.left indentation) ++ " >= " ++ (astToJavascript ast.right indentation) ++ ")"

    else if ast.type == "IDENTIFIER" then
        ast.name

    else if ast.type == "IF" then
        "(" ++ (astToJavascript ast.ifExpr indentation) ++ "\n" ++
        (spaces (indentation + 1)) ++ "? " ++ (astToJavascript ast.thenExpr (indentation + 1)) ++ "\n" ++
        (spaces (indentation + 1)) ++ ": " ++ (astToJavascript ast.elseExpr (indentation + 1)) ++ ")"

    else if ast.type == "IMPORT" then
        (\fileName ->
            "const " ++ (Record.get "name" (Record.get "id" ast)) ++ " = require('" ++
            (
                if (String.startsWith "./" fileName) || (String.startsWith "/" fileName) then
                    fileName
                else
                    "./" ++ fileName
            ) ++ "');"
        ) (String.substring 5 (String.length (Record.get "value" (Record.get "url" ast))) (Record.get "value" (Record.get "url" ast)))

    else if ast.type == "INFIX_OPERATOR" then
        at ast.operator infixOperators

    else if ast.type == "LAMBDA" then
        (\tmpResult -> String.substring 1 (String.length tmpResult - 1) tmpResult)
        ("(" ++ Array.foldr (\accumulator \item -> "(" ++ item ++ " => " ++ accumulator ++ ")") (astToJavascript ast.expression indentation) ast.variables ++ ")")

    else if ast.type == "MODULE" then
        (\imports \suffix ->
            (if (String.length imports) == 0 then
                ""
            else
                imports ++ "\n" ++ "\n") ++
            Array.join ("\n" ++ "\n") (Array.map  (\d -> astToJavascript d indentation) (Record.get "declarations" ast)) ++
            (   if Maybe.isJust (Record.get "optionalExpression" ast) then
                    "\n" ++ "\nconst _$EXPR = " ++ (astToJavascript (Maybe.withDefault () (Record.get "optionalExpression" ast)) indentation) ++ ";"
                else
                    "") ++
            "\n" ++ "\n" ++ "const _$ASSUMPTIONS = [].concat(\n" ++
            Array.join ",\n" (
                Array.map (\i ->
                        "  " ++
                        (Record.get "name" (Record.get "id" i)) ++
                        "._$ASSUMPTIONS || []")
                    (Record.get "imports" ast)) ++
            ");\n" ++ "\n" ++
            "_$ASSUMPTIONS.push({\n" ++
            "  source: '" ++
            (simplifyPath (encodeString (Record.get "sourceName" ast))) ++
            "',\n" ++
            "  declarations: [\n" ++
            Array.join ",\n" (
                Array.map
                    (\d ->
                        "    {\n" ++
                        "      name: \'" ++
                        d.name ++
                        "\',\n" ++
                        "      predicates: [\n" ++
                        Array.join ",\n" (
                            Array.map
                                (\a ->
                                    "        {\n" ++
                                    "          line: " ++
                                    a.line ++
                                    ",\n" ++
                                    "          source: \'" ++
                                    simplifyPath(encodeString(a.sourceName)) ++
                                    "\',\n" ++
                                    "          text: \'" ++
                                    encodeString(a.text) ++
                                    "\',\n" ++
                                    "          predicate: () => " ++
                                    astToJavascript (a.expression)(6) ++
                                    "\n" ++
                                    "        }")
                                (Record.get "assumptions" d)) ++
                        "\n" ++
                        "      ]\n" ++
                        "    }"
                    )
                    (Array.filter (\d -> (Array.length (Record.get "assumptions" d)) > 0) (Record.get "declarations" ast))
            ) ++
            "\n" ++
            "  ]\n" ++
            "});\n" ++ "\n" ++
            suffix
        ) (moduleImports (Record.get "imports" ast) indentation)
          (moduleSuffix (Record.get "declarations" ast) (Record.get "optionalExpression" ast))
    else
        Helper.astToJavascript ast indentation;


moduleImports imports indentation =
    Array.join "\n" (Array.map (\i -> astToJavascript i indentation) imports);


moduleSuffix declarations optionalExpression =
        if (Array.length declarations) == 0 && !Maybe.isJust optionalExpression then
            "\n" ++ "module.exports = {\n" ++ (spaces 1) ++ "_$ASSUMPTIONS\n};"
        else if (Array.length declarations) > 0 && !Maybe.isJust optionalExpression then
            "\n" ++ "module.exports = {\n" ++ (Array.join ",\n" (Array.map (\d -> (spaces 1) ++ (Record.get "name" d)) declarations)) ++ ",\n" ++ (spaces 1) ++ "_$ASSUMPTIONS\n};"
        else if (Array.length declarations) > 0 && Maybe.isJust optionalExpression then
            "\n" ++ "module.exports = {\n" ++ (Array.join ",\n" (Array.map (\d -> (spaces 1) ++ (Record.get "name" d)) declarations)) ++ ",\n" ++ (spaces 1) ++ "_$EXPR,\n" ++ (spaces 1) ++ "_$ASSUMPTIONS\n};"
        else
            "\n" ++ "module.exports = {\n" ++ (spaces 1) ++ "_$EXPR,\n" ++ (spaces 1) ++ "_$ASSUMPTIONS\n};";


blanks = "  ";


spaces count =
    blanks.repeat count;


simplifyPath =
    Helper.simplifyPath;


at i a =
    Maybe.withDefault () (Array.at i a);
