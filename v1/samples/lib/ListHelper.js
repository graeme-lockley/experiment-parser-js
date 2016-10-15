function Cons(car) {
    return cons => {
        return {
            car: car,
            cons: cons
        };
    }
}

const Nil = null;


function isNil(x) {
    return x == null;
}


function head(x) {
    return x.car;
}


function tail(xs) {
    return xs.cons;
}


function range(min) {
    return max => {
        let current = Nil;
        let top = max;
        while (top >= min) {
            current = Cons(top)(current);
            top -= 1;
        }
        return current;
    };
}

module.exports = {
    Cons, head, isNil, Nil, tail, range
};
