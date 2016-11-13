import file:./LexerHelper as Helper;

import file:../core/Array as Array;
import file:../core/Debug as DEBUG;
import file:../core/Maybe as Maybe;
import file:../core/Record as Record;
import file:../core/RegularExpression as RegularExpression;
import file:../core/String as String;
import file:../core/Tuple as Tuple;


fromString input sourceName =
    next lexerState
        where {
            lexerInput = Record.mk3
                "content" input
                "length" (String.length input)
                "sourceName" sourceName;
            lexerState = newLexerRecord lexerInput 0 1 1 0 1 1 0 ""
        };


next lexer =
    if id lexer == TokenEnum.EOF then
        lexer
    else
        nextToken (skipWhiteSpace lexer);


nextToken lexer =
    if isEndOfFile lexer then
        advanceLexer lexer TokenEnum.EOF ""
    else
        findToken lexer;


skipWhiteSpace lexer =
    Maybe.withDefault lexer (matchRegularExpressionAndAdvanceLexer whiteSpaceRegEx (\_ -> TokenEnum.UNKNOWN) lexer);


findToken lexer =
    Maybe.withDefault () (Array.findMap (\pattern -> matchRegularExpressionAndAdvanceLexer (Tuple.first pattern) (Tuple.second pattern) lexer ) tokenPatterns);


matchRegularExpressionAndAdvanceLexer regex resolveToken lexer =
    Maybe.map (\text -> advanceLexer lexer (resolveToken text) text) (RegularExpression.matchFromIndex regex lexer.index (content lexer));


advanceLexer lexer id text =
    newLexerRecord lexer.input id _x _y cursor.index cursor.indexX cursor.indexY _indexXY text
        where {
            _x = lexer.indexX;
            _y = lexer.indexY;
            _indexXY = lexer.index;
            cursor = String.foldl foldFunction foldInit text
                         where {
                            foldFunction cursor c =
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
                                         cursor;
                             foldInit = Record.mk3
                                 "indexX" _x
                                 "indexY" _y
                                 "index" _indexXY
                         }
        };


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