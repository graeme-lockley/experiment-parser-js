import file:./ArrayHelper as AH;
import file:./Maybe as Maybe;

import file:./Debug as DEBUG;


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
    DEBUG.eq (at 0 empty) Maybe.Nothing;
    DEBUG.eq (at 0 (append 1 empty)) (Maybe.Just 1);
    DEBUG.eq (at 0 (append 2 (append 1 empty))) (Maybe.Just 1);
    DEBUG.eq (at 1 (append 2 (append 1 empty))) (Maybe.Just 2)
};


empty =
    AH.empty;


mk1 _1 =
    prepend _1 empty;


mk2 _1 _2 =
    prepend _1 (mk1 _2);


mk3 _1 _2 _3 =
    prepend _1 (mk2 _2 _3);


mk4 _1 _2 _3 _4 =
    prepend _1 (mk3 _2 _3 _4);


mk5 _1 _2 _3 _4 _5 =
    prepend _1 (mk4 _2 _3 _4 _5);


