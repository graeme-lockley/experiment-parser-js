import file:./RecordHelper as Helper;


get name d =
    Helper.get name d
assumptions {
    (get "hello" (mk1 "hello" 2)) == 2;
    !(get "hello" mk0)
};


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