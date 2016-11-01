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


join separator a =
    a.join(separator);


map f a =
    AH.map f a;


findMap =
    AH.findMap;


slice n a =
    a.slice(n);


filter f a =
    AH.filter f a;


take n a =
    AH.slice 0 n a;


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


mk6 _1 _2 _3 _4 _5 _6 =
    prepend _1 (mk5 _2 _3 _4 _5 _6);


mk7 _1 _2 _3 _4 _5 _6 _7 =
    prepend _1 (mk6 _2 _3 _4 _5 _6 _7);


mk8 _1 _2 _3 _4 _5 _6 _7 _8 =
    prepend _1 (mk7 _2 _3 _4 _5 _6 _7 _8);


mk9 _1 _2 _3 _4 _5 _6 _7 _8 _9 =
    prepend _1 (mk8 _2 _3 _4 _5 _6 _7 _8 _9);


mk10 _1 _2 _3 _4 _5 _6 _7 _8 _9 _10 =
    prepend _1 (mk9 _2 _3 _4 _5 _6 _7 _8 _9 _10);


mk11 _1 _2 _3 _4 _5 _6 _7 _8 _9 _10 _11 =
    prepend _1 (mk10 _2 _3 _4 _5 _6 _7 _8 _9 _10 _11);


mk12 _1 _2 _3 _4 _5 _6 _7 _8 _9 _10 _11 _12 =
    prepend _1 (mk11 _2 _3 _4 _5 _6 _7 _8 _9 _10 _11 _12);


mk13 _1 _2 _3 _4 _5 _6 _7 _8 _9 _10 _11 _12 _13 =
    prepend _1 (mk12 _2 _3 _4 _5 _6 _7 _8 _9 _10 _11 _12 _13);


