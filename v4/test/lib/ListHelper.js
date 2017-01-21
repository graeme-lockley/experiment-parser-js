function cons(car) {
    return cdr => {
        return {
            car: car,
            cdr: cdr
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
    return xs.cdr;
}


module.exports = {
    cons, head, isEmpty, empty, tail
};
