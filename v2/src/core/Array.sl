import file:./ArrayHelper as AH;
import file:./Maybe as Maybe;

import file:./Object as Object;


append =
    AH.append;


prepend =
    AH.prepend;


foldl f z array =
    AH.foldl f z array
assumptions {
    foldl (\acc \i -> acc ++ i) "" (AH.prepend "Hello" (AH.prepend "World" AH.empty)) == "HelloWorld"
};


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


slice n a =
    a.slice(n);


at =
    AH.at
assumptions {
    Object.eq (at 0 empty) Maybe.Nothing;
    Object.eq (at 0 (append 1 empty)) (Maybe.Just 1);
    Object.eq (at 0 (append 2 (append 1 empty))) (Maybe.Just 1);
    Object.eq (at 1 (append 2 (append 1 empty))) (Maybe.Just 2)
};
