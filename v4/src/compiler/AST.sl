import file:../core/Record as Record;


addition left right =
    Record.mk3
        "type" "ADDITION"
        "left" left
        "right" right;


adtDeclaration name parameters constructors =
        Record.mk4
        "type" "ADT_DECLARATION"
        "name" name
        "parameters" parameters
        "constructors" constructors;


apply operation operand =
    Record.mk3
        "type" "APPLY"
        "operation" operation
        "operand" operand;


assumption sourceName line text expression =
    Record.mk5
        "type" "ASSUMPTION"
        "sourceName" sourceName
        "line" line
        "text" text
        "expression" expression;


booleanAnd left right =
    Record.mk3
        "type" "BOOLEAN_AND"
        "left" left
        "right" right;


booleanNot operand =
    Record.mk2
        "type" "BOOLEAN_NOT"
        "operand" operand;


booleanOr left right =
    Record.mk3
        "type" "BOOLEAN_OR"
        "left" left
        "right" right;


caseExpression expression patterns =
    Record.mk3
        "type" "CASE"
        "expression" expression
        "patterns" patterns;


composition left right =
    Record.mk3
        "type" "COMPOSITION"
        "left" left
        "right" right;


constantBoolean value =
    Record.mk2
        "type" "CONSTANT_BOOLEAN"
        "value" value;


constantCharacter value =
    Record.mk2
        "type" "CONSTANT_CHARACTER"
        "value" value;


constantInteger value =
    Record.mk2
        "type" "CONSTANT_INTEGER"
        "value" value;


constantString value =
    Record.mk2
        "type" "CONSTANT_STRING"
        "value" value;


constantUnit =
    Record.mk1
        "type" "CONSTANT_UNIT";


constantURL value =
    Record.mk2
        "type" "CONSTANT_URL"
        "value" value;


declaration name expression a =
    Record.mk4
        "type" "DECLARATION"
        "name" name
        "expression" expression
        "assumptions" a;


division left right =
    Record.mk3
        "type" "DIVISION"
        "left" left
        "right" right;


equal left right =
    Record.mk3
        "type" "EQUAL"
        "left" left
        "right" right;


expressions e =
    Record.mk2
        "type" "EXPRESSIONS"
        "expressions" e;


greaterThan left right =
   Record.mk3
        "type" "GREATER_THAN"
        "left" left
        "right" right;


greaterThanEqual left right =
    Record.mk3
        "type" "GREATER_THAN_EQUAL"
        "left" left
        "right" right;


identifier name =
    Record.mk2
        "type" "IDENTIFIER"
        "name" name;


ifte ifExpr thenExpr elseExpr =
    Record.mk4
        "type" "IF"
        "ifExpr" ifExpr
        "thenExpr" thenExpr
        "elseExpr" elseExpr;


importModule url id =
    Record.mk3
        "type" "IMPORT"
        "url" url
        "id" id;

infixOperator operator =
    Record.mk2
        "type" "INFIX_OPERATOR"
        "operator" operator;

lambda variable expression =
    Record.mk3
        "type" "LAMBDA"
        "variable" variable
        "expression" expression;


lessThan left right =
    Record.mk3
        "type" "LESS_THAN"
        "left" left
        "right" right;


lessThanEqual left right =
     Record.mk3
        "type" "LESS_THAN_EQUAL"
        "left" left
        "right" right;


moduleDeclaration sourceName imports declarations expression =
    Record.mk5
        "type" "MODULE"
        "sourceName" sourceName
        "imports" imports
        "declarations" declarations
        "expression" expression;


multiplication left right =
      Record.mk3
        "type" "MULTIPLICATION"
        "left" left
        "right" right;


notEqual left right =
    Record.mk3
        "type" "NOT_EQUAL"
        "left" left
        "right" right;


qualifiedIdentifier m identifier =
    Record.mk3
        "type" "QUALIFIED_IDENTIFIER"
        "module" m
        "identifier" identifier;


scopedDeclarations declarations expression =
    Record.mk3
        "type" "SCOPE"
        "declarations" declarations
        "expression" expression;


stringConcat left right =
    Record.mk3
        "type" "STRING_CONCAT"
        "left" left
        "right" right;


subtraction left right =
   Record.mk3
        "type" "SUBTRACTION"
        "left" left
        "right" right;


typeAlias name parameters value =
    Record.mk4
        "type" "TYPE_ALIAS"
        "name" name
        "parameters" parameters
        "value" value;


typeSignature name value =
    Record.mk3
        "type" "TYPE_SIGNATURE"
        "name" name
        "value" value;


unaryPlus operand =
    Record.mk2
        "type" "UNARY_PLUS"
        "operand" operand;


unaryNegate operand =
    Record.mk2
        "type" "UNARY_NEGATE"
        "operand" operand;
