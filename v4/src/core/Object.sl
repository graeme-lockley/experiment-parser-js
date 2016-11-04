import file:./ObjectHelper as Helper;


eq l r =
    Helper.objectEquals l r;


neq l r =
    !(Helper.objectEquals l r);