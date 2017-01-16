import file:./ListHelper as Helper;


cons =
    Helper.cons;


head =
    Helper.head;


isEmpty =
    Helper.isEmpty;


empty =
    Helper.empty;


tail =
    Helper.tail;


length ls =
    if isEmpty ls then
        0
    else
        1 + (length (tail ls));


map f list =
    if isEmpty list then
        empty
    else
        cons (f (head list)) (map f (tail list));


sum list =
    if isEmpty list then
        0
    else
        (head list) + (sum (tail list));


filter predicate list =
    if isEmpty list then
        empty
    else if predicate (head list) then
        cons (head list) (filter predicate (tail list))
    else
        filter predicate (tail list);


range min max =
    if min > max then
        empty
    else
        cons min (range (min + 1) max);


