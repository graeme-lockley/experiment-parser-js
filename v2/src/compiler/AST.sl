import file:../core/Dictionary as Dictionary;


addition left right =
    Dictionary.mk3
        "type" "ADDITION"
        "left" left
        "right" right;


apply expressions =
    Dictionary.mk2
        "type" "APPLY"
        "expressions" expressions;


assumption sourceName line text expression =
    Dictionary.mk5
        "type" "ASSUMPTION"
        "sourceName" sourceName
        "line" line
        "text" text
        "expression" expression;


booleanAnd expressions =
    Dictionary.mk2
        "type" "BOOLEAN_AND"
        "expressions" expressions;


booleanNot operand =
    Dictionary.mk2
        "type" "BOOLEAN_NOT"
        "operand" operand;


booleanOr expressions =
    Dictionary.mk2
        "type" "BOOLEAN_OR"
        "expressions" expressions;


composition left right =
    Dictionary.mk3
        "type" "COMPOSITION"
        "left" left
        "right" right;


constantBoolean value =
    Dictionary.mk2
        "type" "CONSTANT_BOOLEAN"
        "value" value;


constantCharacter value =
    Dictionary.mk2
        "type" "CONSTANT_CHARACTER"
        "value" value;


constantInteger value =
    Dictionary.mk2
        "type" "CONSTANT_INTEGER"
        "value" value;


constantString value =
    Dictionary.mk2
        "type" "CONSTANT_STRING"
        "value" value;


constantUnit =
    Dictionary.mk1
        "type" "CONSTANT_UNIT";


constantURL value =
    Dictionary.mk2
        "type" "CONSTANT_URL"
        "value" value;


declaration name expression a =
    Dictionary.mk4
        "type" "DECLARATION"
        "name" name
        "expression" expression
        "assumptions" a;


division left right =
    Dictionary.mk3
        "type" "DIVISION"
        "left" left
        "right" right;


equal left right =
    Dictionary.mk3
        "type" "EQUAL"
        "left" left
        "right" right;


expressions e =
    Dictionary.mk2
        "type" "EXPRESSIONS"
        "expressions" e;


greaterThan left right =
   Dictionary.mk3
        "type" "GREATER_THAN"
        "left" left
        "right" right;


greaterThanEqual left right =
    Dictionary.mk3
        "type" "GREATER_THAN_EQUAL"
        "left" left
        "right" right;


identifier name =
    Dictionary.mk2
        "type" "IDENTIFIER"
        "name" name;


ifte ifExpr thenExpr elseExpr =
    Dictionary.mk4
        "type" "IF"
        "ifExpr" ifExpr
        "thenExpr" thenExpr
        "elseExpr" elseExpr;


importModule url id =
    Dictionary.mk3
        "type" "IMPORT"
        "url" url
        "id" id;

infixOperator operator =
    Dictionary.mk2
        "type" "INFIX_OPERATOR"
        "operator" operator;

lambda variables expression =
    Dictionary.mk3
        "type" "LAMBDA"
        "variables" variables
        "expression" expression;


lessThan left right =
    Dictionary.mk3
        "type" "LESS_THAN"
        "left" left
        "right" right;


lessThanEqual left right =
     Dictionary.mk3
        "type" "LESS_THAN_EQUAL"
        "left" left
        "right" right;


moduleDeclaration sourceName imports declarations optionalExpression =
    Dictionary.mk5
        "type" "MODULE"
        "sourceName" sourceName
        "imports" imports
        "declarations" declarations
        "optionalExpression" optionalExpression;


multiplication left right =
      Dictionary.mk3
        "type" "MULTIPLICATION"
        "left" left
        "right" right;


notEqual left right =
    Dictionary.mk3
        "type" "NOT_EQUAL"
        "left" left
        "right" right;


qualifiedIdentifier m identifier =
    Dictionary.mk3
        "type" "QUALIFIED_IDENTIFIER"
        "module" m
        "identifier" identifier;


stringConcat left right =
    Dictionary.mk3
        "type" "STRING_CONCAT"
        "left" left
        "right" right;


subtraction left right =
   Dictionary.mk3
        "type" "SUBTRACTION"
        "left" left
        "right" right;


unaryPlus operand =
    Dictionary.mk2
        "type" "UNARY_PLUS"
        "operand" operand;


unaryNegate operand =
    Dictionary.mk2
        "type" "UNARY_NEGATE"
        "operand" operand;
