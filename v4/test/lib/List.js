function cons(car) {
    return cons => {
        return {
            car: car,
            cons: cons
        };
    }
}

const empty = null;


function isEmpty(x) {
    return x == null;
}


function head(x) {
    return x.car;
}


function tail(xs) {
    return xs.cons;
}


module.exports = {
    cons, head, isEmpty, empty, tail
};