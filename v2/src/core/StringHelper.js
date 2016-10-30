"use strict";


function substring(start) {
    return end => s => s.substring(start, end);
}


function charAt(i) {
    return s => s[i];
}


function characterFromLiteral(c) {
    if (c == '\\n') {
        return '\n';
    } else if (c.length == 2) {
        return c[1];
    } else {
        return c;
    }
}


function stringFromLiteral(s) {
    let result = s;
    let index = 0;
    while (true) {
        if (index >= result.length) {
            return result;
        } else if (result[index] == '\\') {
            result = result.slice(0, index) + characterFromLiteral(result.slice(index, index + 2)) + result.slice(index + 2);
        }

        index += 1;
    }
}


function startsWith(prefix) {
    return s => s.startsWith(prefix);
}


function replace(pattern) {
    return replacement => s => s.replace(pattern, replacement);
}


function foldl(f) {
    return z => s => {
        let result = z;
        for (let i = 0; i < s.length; i += 1) {
            result = f(result)(s.charCodeAt(i));
        }
        return result;
    }
}


module.exports = {
    charAt,
    foldl,
    replace,
    startsWith,
    substring,
    characterFromLiteral,
    stringFromLiteral
};