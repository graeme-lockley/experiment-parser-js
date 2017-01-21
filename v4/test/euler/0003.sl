import file:../lib/List as List;
import file:../lib/Math as Math;


andRange min max predicate =
    if min > max then
        true
    else if predicate min then
        andRange (min + 1) max predicate
    else
        false;


isPrime n =
    if n <= 3 then
        true
    else
        andRange 2 (Math.sqrt n) (\i -> Math.modulus n i > 0);


primeFactors n =
    if isPrime n then
        List.cons n List.empty
    else
        primeFactorsIter 2
            where {
                upper =
                    Math.sqrt n;

                primeFactorsIter i =
                    if Math.modulus n i == 0 then
                        List.cons i (primeFactors (n / i))
                    else if i < upper then
                        primeFactorsIter (i + 1)
                    else
                        List.empty
            };


solution n =
    let {
        maxInList lst =
            if List.isEmpty lst then
                0
            else
                Math.max (List.head lst) (maxInList (List.tail lst))
    } in
        maxInList (primeFactors n)
assumptions {
    solution 600851475143 == 6857
};