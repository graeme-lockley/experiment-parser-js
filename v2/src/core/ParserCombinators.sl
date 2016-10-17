import file:./ParserCombinatorsHelper as Helper;

import file:./Result as Result;
import file:./Tuple as Tuple;


symbol = Helper.symbol;


or = Helper.or;


and = Helper.and;


option = Helper.option;


many = Helper.many;


many1 = Helper.many1;


sepBy1 = Helper.sepBy1;


chainl1 = Helper.chainl1;


map f result =
    Result.map (\t -> Tuple.mapFirst f t) result
assumptions {
    Tuple.first (Result.withDefault 0 (map ((+) 1) (Result.Ok (Tuple.Tuple 1 "Hello")))) == 2
};


errorMessage errorMessage =
    Result.formatError (\_ -> errorMessage)
assumptions {
    Result.errorWithDefault "none" (errorMessage "world" (Result.Error "hello")) == "world"
};

