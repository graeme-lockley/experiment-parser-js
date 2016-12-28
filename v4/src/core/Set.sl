import file:./SetHelper as Helper;

import file:./Debug as DEBUG;


difference s1 s2 =
    Helper.difference s1 s2
assumptions {
    DEBUG.eq (difference setA setB) (singleton 1)
};


empty =
    Helper.empty
assumptions {
    isEmpty empty
};


insert e s =
    Helper.insert e s;


isEmpty s =
    Helper.isEmpty s;


intersection =
    Helper.intersection
assumptions {
    DEBUG.eq (intersection setA setB) (insert 2 (insert 3 empty))
};


singleton e =
    Helper.singleton e;


toList s =
    Helper.toList s;


fromList l =
    Helper.fromList l;


union s1 s2 =
    Helper.union s1 s2
assumptions {
    DEBUG.eq (union setA setB) (insert 1 (insert 2 (insert 3 (insert 4 empty))))
};


has e s =
    s.has e;


setA = insert 1 (insert 2 (insert 3 empty));
setB = insert 2 (insert 3 (insert 4 empty));