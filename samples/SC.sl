import file:./lib/Integer as Integer;
import file:./lib/List as List;
import file:./lib/String as String;
import file:./lib/RegularExpression as RegularExpression;
import file:./lib/Result as Result;
import file:./lib/Maybe as Maybe;


stringToInteger n =
    Maybe.withDefault 0 (Integer.stringToInteger n);


singleSeparatorPattern = Result.withDefault RegularExpression.ANY (RegularExpression.compile "^//(.)\n(.+)$");


add input =
    if RegularExpression.test singleSeparatorPattern input then
        addSingleSeparator input
    else
        addSeparatedString "," input
assumptions {
    add "" == 0;
    add "1" == 1;
    add "1,2,3" == 6;
    add "//;\n1;2;3" == 6
};



addSingleSeparator input =
    (\matchResult -> addSeparatedString (List.head matchResult) (List.head (List.tail matchResult)))
    (Maybe.withDefault List.Nil (RegularExpression.match singleSeparatorPattern input));


addSeparatedString separator items =
        List.fold (+) 0 (List.map stringToInteger (String.split separator items));
