const empty = new Set();

function isEmpty(s) {
    return s.size == 0;
}

function singleton(e) {
    const result = new Set();
    result.add(e);
    return result;
}

function union(s1) {
    return s2 => {
        const result = new Set(s1);
        for (const elem of s2) {
            result.add(elem);
        }
        return result;
    }
}

module.exports = {
    empty,
    isEmpty,
    singleton,
    union
};