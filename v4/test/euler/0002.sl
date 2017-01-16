import file:../lib/List as List;
import file:../lib/Math as Math;


mapRangeCondition v f predicate =
    let {
        mapV =
            f v
    } in
        if predicate mapV then
            List.cons mapV (mapRangeCondition (v + 1) f predicate)
        else
            List.nil;


fib n =
    if n <= 1 then
        n
    else
        (fib (n-1)) + (fib (n-2));


isEven n =
    Math.modulus n 2 == 0;


solution upper =
    List.sum (List.filter isEven (mapRangeCondition 1 fib (\n -> n < upper)))
assumptions {
    solution 4000000 == 4613732
};

