const LH = require('./ListHelper');


function length(x) {
    return x.length;
}


function toList(x) {
    let result = LH.Nil;

    for (let lp = x.length - 1; lp >= 0; lp -= 1) {
        result = LH.Cons(x[lp])(result);
    }

    return result;
}


module.exports = {
    length,
    toList
};