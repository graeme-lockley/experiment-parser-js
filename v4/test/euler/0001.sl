import file:../lib/List as List;
import file:../lib/Math as Math;


range min max =
    if min > max then
        List.empty
    else
        List.cons min (range (min + 1) max);


filter predicate list =
    if List.isEmpty list then
        List.empty
    else if predicate (List.head list) then
        List.cons (List.head list) (filter predicate (List.tail list))
    else
        filter predicate (List.tail list);


multipleOf n m =
    Math.modulus n m == 0;


sum list =
    if List.isEmpty list then
        0
    else
        (List.head list) + (sum (List.tail list));


solution upper =
    sum (filter (\n -> multipleOf n 3 || multipleOf n 5) (range 1 upper))
assumptions {
    solution 999 == 233168
};