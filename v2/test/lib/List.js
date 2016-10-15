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


module.exports = {
    Cons, head, isNil, Nil, tail
};