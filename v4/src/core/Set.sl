import file:./SetHelper as Helper;


empty =
    Helper.empty
assumptions {
    isEmpty empty
};


singleton e =
    Helper.singleton e;


isEmpty s =
    Helper.isEmpty s;


union s1 s2 =
    Helper.union s1 s2;


has e s =
    s.has e;