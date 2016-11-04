import file:./LexerHelper as Helper;

import file:../core/Array as Array;
import file:../core/Debug as DEBUG;
import file:../core/Maybe as Maybe;
import file:../core/Record as Record;
import file:../core/RegularExpression as RegularExpression;
import file:../core/String as String;
import file:../core/Tuple as Tuple;


fromString input sourceName =
    (\lexerInput -> next (newLexerRecord lexerInput 0 1 1 0 1 1 0 ""))
        (Record.mk3
            "content" input
            "length" (String.length input)
            "sourceName" sourceName);


next lexer =
    if (id lexer) == TokenEnum.EOF then
        lexer
    else
        (\newLexer ->
            if isEndOfFile newLexer then
                advanceLexer lexer TokenEnum.EOF ""
            else
                Maybe.withDefault () (Array.findMap (\pattern ->
                        Maybe.map (\text -> advanceLexer newLexer (Tuple.second pattern text) text) (RegularExpression.matchFromIndex (Tuple.first pattern) newLexer.index (content newLexer))
                    ) tokenPatterns)
        ) (Maybe.withDefault lexer (Maybe.map (\whitespace -> advanceLexer lexer TokenEnum.UNKNOWN whitespace) (RegularExpression.matchFromIndex whiteSpaceRegEx lexer.index (content lexer))));


advanceLexer lexer id text =
    (\_x \_y \_indexXY ->
        (\cursor ->
            newLexerRecord lexer.input id _x _y cursor.index cursor.indexX cursor.indexY _indexXY text
        ) (String.foldl
            (\cursor \c ->
                if (c == 10) then
                    Record.set3
                        "indexX" 1
                        "indexY" (cursor.indexY + 1)
                        "index" (cursor.index + 1)
                        cursor
                else
                    Record.set2
                        "indexX" (cursor.indexX + 1)
                        "index" (cursor.index + 1)
                        cursor)
            (Record.mk3
                "indexX" _x
                "indexY" _y
                "index" _indexXY)
            text)
    ) lexer.indexX lexer.indexY lexer.index;


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


content =
    (Record.get "content") o (Record.get "input");


streamText startXY endXY =
    (String.substring startXY endXY) o (Record.get "content") o (Record.get "input");


TokenEnum =
    Helper.TokenEnum;


reservedIdentifiers =
    Helper.reservedIdentifiers;


whiteSpaceRegEx =
    Helper.whiteSpaceRegEx;


tokenPatterns =
    Helper.tokenPatterns;