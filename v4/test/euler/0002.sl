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
    fibIter n 1 0
        where {
            fibIter n a b =
                if n <= 1 then
                    a
                else
                    fibIter (n - 1) (a + b) a
        };


isEven n =
    Math.modulus n 2 == 0;


solution upper =
    List.sum (List.filter isEven (mapRangeCondition 1 fib (\n -> n < upper)))
assumptions {
    solution 4000000 == 4613732
};

