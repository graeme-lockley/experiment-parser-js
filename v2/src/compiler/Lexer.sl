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
    Helper.initialContext;


id =
    Record.get "_id";


sourceName =
    (Record.get "sourceName") o (Record.get "input");


text =
    Record.get "_text";


x =
    Record.get "_x";


y =
    Record.get "_y";


indexXY =
    Record.get "_indexXY";


streamText startXY endXY =
    (String.substring startXY endXY) o (Record.get "content") o (Record.get "input");
