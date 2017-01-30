import file:../lib/List as List;
import file:../lib/Math as Math;


isDivisibleBy m n =
    Math.modulus m n == 0
assumptions {
    isDivisibleBy 10 5;
    isDivisibleBy 9 3;
    ! isDivisibleBy 10 7
};


findSmallest n =
    let {
        numbers =
            List.range 2 n;

        checkIsCandidate candidate =
            List.foldl (\result \i -> result && (isDivisibleBy candidate i)) true numbers
    } in
        List.find (\candidate -> checkIsCandidate candidate) (\candidate -> candidate + 1) 2
assumptions {
    findSmallest 10 == 2520
};



