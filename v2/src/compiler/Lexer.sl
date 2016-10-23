import file:./LexerHelper as Helper;

import file:../core/Debug as DEBUG;
import file:../core/Record as Record;
import file:../core/String as String;


TokenEnum =
    Helper.TokenEnum;


symbols =
    Helper.symbols;


reservedIdentifiers =
    Helper.reservedIdentifiers;


isWhitespace =
    Helper.isWhitespace;


isEndOfLine =
    Helper.isEndOfLine;


isDigit =
    Helper.isDigit;


isIdentifierStart =
    Helper.isIdentifierStart;


isIdentifierRest =
    Helper.isIdentifierRest;


initialContext =
    Helper.initialContext;


fromString =
    Helper.fromString;


sourceName =
    Helper.sourceName;


y =
    Helper.y;


indexXY =
    Helper.indexXY;


content lexer =
    Record.get "content" (Record.get "input" lexer);


streamText startXY endXY lexer =
    String.substring startXY endXY (content lexer);
