const Result = require('./Result');
const Array = require('./Array');
const Maybe = require('./Maybe');


const ANY = /./;


function compile(s) {
    try {
        return Result.Ok(new RegExp(s));
    } catch (error) {
        return Result.Error(error.toString());
    }
}


function test(re) {
    return s => re.test(s);
}


function match(re) {
    return s => {
        const result = re.exec(s);

        if (result) {
            return Maybe.Just(Array.toList(result.slice(1)));
        } else {
            return Maybe.Nothing;
        }
    }
}


module.exports = {
    ANY, compile, match, test
};