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
    if ast.type == "MODULE" then
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

