function foldr(initValue, foldFunction, arr) {
    let result = initValue;

    for (let index = arr.length - 1; index >= 0; index -= 1) {
        result = foldFunction(result, arr[index]);
    }

    return result;
}

module.exports = {
    foldr
};