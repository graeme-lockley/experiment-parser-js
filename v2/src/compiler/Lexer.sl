import file:./LexerHelper as Helper;

import file:../core/Debug as DEBUG;
import file:../core/Record as Record;
import file:../core/String as String;


TokenEnum =
    Helper.TokenEnum;


fromString input sourceName =
    (\lexerInput -> Helper.next (Helper.newLexerRecord lexerInput 0 1 1 0 1 1 0 ""))
        (Record.mk3
            "content" input
            "length" (String.length input)
            "sourceName" sourceName);


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


next =
    Helper.next;