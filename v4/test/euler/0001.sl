import file:../lib/List as List;
import file:../lib/Math as Math;


multipleOf n m =
    Math.modulus n m == 0;


solution upper =
    List.sum (List.filter (\n -> multipleOf n 3 || multipleOf n 5) (List.range 1 upper))
assumptions {
    solution 999 == 233168
};