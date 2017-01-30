function cons(car) {
    return cdr => {
        return {
            car: car,
            cdr: cdr
        };
    }
}

const empty = null;


function find(predicate) {
    return next => start => {
        while(!predicate(start)) {
            start = next(start);
        }
        return start;
    };
}


function foldl(foldFunction) {
    return initValue => arr => {
        let result = initValue;

        while (!isEmpty(arr)) {
            result = foldFunction(result)(head(arr));
            arr = tail(arr);
        }

        return result;
    }
}


function isEmpty(x) {
    return x == null;
}


function head(x) {
    return x.car;
}


function range(min) {
    return max => {
        let result = empty;
        while (max >= min) {
            result = cons(max)(result);
            max -= 1;
        }

        return result;
    };
}


function tail(xs) {
    return xs.cdr;
}


module.exports = {
    cons, empty, find, foldl, head, isEmpty, range, tail
};
