"use strict";


function substring(start) {
    return end => s => s.substring(start, end);
}


function charAt(i) {
    return s => s[i];
}


module.exports = {
    charAt,
    substring
};