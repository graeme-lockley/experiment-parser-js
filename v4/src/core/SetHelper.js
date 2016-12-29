const empty = new Set();


function difference(s1) {
    return s2 => new Set([...s1].filter(x => !s2.has(x)));
}


function insert(e) {
    return s => new Set(s).add(e);
}


function intersection(s1) {
    return s2 => new Set ([...s1].filter(x => s2.has(x)));
}


function isEmpty(s) {
    return s.size == 0;
}


function singleton(e) {
    const result = new Set();
    result.add(e);
    return result;
}


function toList(s) {
    return Array.from(s).sort();
}


function fromList(l) {
    return new Set(l);
}


function union(s1) {
    return s2 => new Set([...s1, ...s2]);
}


module.exports = {
    difference,
    empty,
    fromList,
    insert,
    isEmpty,
    intersection,
    singleton,
    toList,
    union
};