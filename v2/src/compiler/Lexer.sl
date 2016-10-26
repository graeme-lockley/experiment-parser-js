import file:./LexerHelper as Helper;

import file:../core/Debug as DEBUG;
import file:../core/Record as Record;
import file:../core/String as String;


TokenEnum =
    Helper.TokenEnum;


fromString input sourceName =
    (\lexerInput -> Helper.next (newLexerRecord lexerInput 0 1 1 0 1 1 0 ""))
        (Record.mk3
            "content" input
            "length" (String.length input)
            "sourceName" sourceName);


newLexerRecord input id x y index indexX indexY indexXY text =
    Record.mk9
        "input" input
        "_id" id
        "_x" x
        "_y" y
        "index" index
        "indexX" indexX
        "indexY" indexY
        "_indexXY" indexXY
        "_text" text;


isEndOfFile lexer =
    (index lexer) >= (contentLength lexer);


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


index =
    Record.get "index";


contentLength =
    (Record.get "length") o (Record.get "input");


streamText startXY endXY =
    (String.substring startXY endXY) o (Record.get "content") o (Record.get "input");


next =
    Helper.next;