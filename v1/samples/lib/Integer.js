const Maybe = require('./Maybe');


function stringToInteger(s) {
    const value = parseInt(s);
    return isNaN(value)
        ? Maybe.Nothing
        : Maybe.Just(value);
}


module.exports = {
    stringToInteger
};