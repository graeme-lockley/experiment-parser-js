import file:../lib/Integer as Integer;
import file:../lib/Math as Math;
import file:../lib/String as String;


isPalindrome s =
    if String.length s < 2 then
        true
    else
        ((String.charAt 0 s) == (String.charAt (lengthOfS - 1) s)) && (isPalindrome (String.slice 1 (lengthOfS - 1) s))
            where {
                lengthOfS =
                    String.length s
            }
assumptions {
    isPalindrome "";
    isPalindrome "2";
    isPalindrome "121";
    isPalindrome "12321";
    !isPalindrome "12331"
};


findLPP n m =
    let {
        findLPPIterOnRow i j =
            (if isPalindrome (Integer.toS (i * j)) then
                Math.max (i * j) rest
            else
                rest)
                where {
                    rest =
                        if j < m then
                            findLPPIterOnRow i (j + 1)
                        else
                            0
                };

        findLPPIter i =
            if i < n then
                Math.max (findLPPIterOnRow i 0) (findLPPIter (i + 1))
            else
                0
    } in
        findLPPIter 0
assumptions {
    findLPP 99 99 == 9009
};
