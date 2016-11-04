const Maybe = require("./Maybe");


function matchFromIndex(regex) {
    return fromIndex => content => {
        regex.lastIndex = fromIndex;
        const result = regex.exec(content);
        return result ? Maybe.Just(result[0]) : Maybe.Nothing;
    };
}


function compile(string) {
    try {
        return Maybe.Just(new RegExp(string));
    } catch (e) {
        return Maybe.Nothing;
    }
}


function compileWithOptions(string) {
    return options => {
        try {
            return Maybe.Just(new RegExp(string, options));
        } catch (e) {
            return Maybe.Nothing;
        }
    }
}


module.exports = {
    compile,
    compileWithOptions,
    matchFromIndex
};