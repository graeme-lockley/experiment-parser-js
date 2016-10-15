import file:./ListHelper as LH;
import file:./Maybe as Maybe;

Cons = LH.Cons;
Nil = LH.Nil;
head = LH.head;
tail = LH.tail;
isNil = LH.isNil;


range min max =
	rangeReverse max min Nil;


rangeReverse max min result =
	if max < min then
		result
	else
		rangeReverse (max - 1) min (Cons max result);


foldl op z xs =
    if isNil xs then
        z
    else
        foldl op (op z (head xs)) (tail xs);


fold = foldl
assumptions {
    foldl (+) 0 Nil == 0;
    foldl (+) 10 (Cons 1 (Cons 2 (Cons 3 Nil))) == 16;
    foldl (+) 0 (range 1 100) == 5050
};


length = fold (\acc \_ -> 1 + acc) 0
assumptions {
    length Nil == 0;
    length (range 1 100) == 100;
    length (Cons "Hello" (Cons "World" Nil)) == 2
};


map f xs =
    if isNil xs then
        xs
     else
        Cons (f (head xs)) (map f (tail xs));


at n xs =
    if isNil xs then
        Maybe.Nothing
    else if n == 0 then
        Maybe.Just (head xs)
    else
        at (n - 1) (tail xs);