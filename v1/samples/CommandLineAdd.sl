import file:./lib/List as List;
import file:./lib/Array as Array;
import file:./lib/Integer as Integer;
import file:./lib/Maybe as Maybe;


toInteger s =
    Maybe.withDefault 0 (Integer.stringToInteger s)
assumptions {
	toInteger "123" == 123;
	toInteger "a" == 0;
	toInteger "1a" == 1
};


main params =
	List.map toInteger (Array.toList params);
	
