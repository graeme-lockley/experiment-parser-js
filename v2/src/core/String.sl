import file:./StringHelper as Helper;

import file:./Debug as DEBUG;


length s =
    s.length
assumptions {
    (length "") == 0;
    (length "hello") == 5
};


substring =
    Helper.substring
assumptions {
    DEBUG.eq (substring 1 3 "hello") "el";
    DEBUG.eq (substring 1 10 "hello") "ello"
};



foldl f z s =
    Helper.foldl f z s
assumptions {
    foldl (\acc \_ -> acc + 1) 0 "hello" == 5
};



toChar s =
    charAt 0 s;


fromLiteral =
    Helper.stringFromLiteral;


charAt i s =
    Helper.charAt i s;


trim s =
    s.trim();

