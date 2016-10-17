import file:./ArrayHelper as AH;
import file:./Maybe as Maybe;


append =
    AH.append;


prepend =
    AH.prepend;


foldr f z array =
    AH.foldr f z array;


findFirst =
    AH.findFirst;


empty =
    AH.empty;


length a =
    a.length
assumptions {
    length empty == 0;
    length (append 1 empty) == 1
};


at =
    AH.at
assumptions {
    Maybe.withDefault (-1) (at 0 empty) == (-1);
    Maybe.withDefault (-1) (at 0 (append 1 empty)) == 1;
    Maybe.withDefault (-1) (at 0 (append 2 (append 1 empty))) == 1;
    Maybe.withDefault (-1) (at 1 (append 2 (append 1 empty))) == 2
};
