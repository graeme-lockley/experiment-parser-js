function log(label) {
    return value => {
        console.log(label + ": " + (JSON.stringify(value, null, 2)));
        return value;
    };
}


module.exports = {
    log
};
