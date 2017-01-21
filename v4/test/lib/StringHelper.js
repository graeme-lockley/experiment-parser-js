function charAt(index) {
    return s => s[index];
}


function length(s) {
    return s.length;
}


function slice(startIndex) {
    return endIndex => s => s.substring(startIndex, endIndex);
}


function trim(s) {
    return s.trim();
}

module.exports = {
    charAt,
    length,
    slice,
    trim
};