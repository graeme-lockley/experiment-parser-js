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