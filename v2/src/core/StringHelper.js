"use strict";

function substring(start) {
    return end => s => s.substring(start, end);
}


module.exports = {
    substring
};