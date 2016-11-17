import file:./RecordHelper as Helper;


get name d =
    Helper.get name d
assumptions {
    (get "hello" (mk1 "hello" 2)) == 2;
    !(get "hello" mk0)
};


set1 =
    Helper.set1;


set2 =
    Helper.set2;


set3 =
    Helper.set3;


mk0 =
    Helper.mk0;


mk1 =
    Helper.mk1;


mk2 =
    Helper.mk2;


mk3 =
    Helper.mk3;


mk4 =
    Helper.mk4;


mk5 =
    Helper.mk5;


mk6 =
    Helper.mk6;


mk7 =
    Helper.mk7;


mk8 =
    Helper.mk8;


mk9 =
    Helper.mk9;


union a b =
    Helper.union a b;