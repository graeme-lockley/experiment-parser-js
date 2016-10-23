const Record = require("../core/Record");


function isEndOfLine(c) {
    return c == 10;
}


function createCursor(context) {
    return Record.mk8
        ("index")(context.index)
        ("indexX")(context.indexX)
        ("indexY")(context.indexY)
        ("_indexXY")(context.index)
        ("x")(context.indexX)
        ("y")(context.indexY)
        ("content")(context.input.content)
        ("length")(context.input.length);
}

function charCodeAtIndex(cursor) {
    return cursor.content.charCodeAt(cursor.index);
}

function is(predicate) {
    return cursor => isNotEndOfFile(cursor) && predicate(charCodeAtIndex(cursor));
}

function isNot(predicate) {
    return cursor => isNotEndOfFile(cursor) && !predicate(charCodeAtIndex(cursor));
}

function isChar(c) {
    return cursor => isNotEndOfFile(cursor) && charCodeAtIndex(cursor) == c.charCodeAt(0);
}

function isNotChar(c) {
    return cursor => isNotEndOfFile(cursor) && charCodeAtIndex(cursor) != c.charCodeAt(0);
}

function isEndOfFile(cursor) {
    return cursor.index >= cursor.length;
}

function isNotEndOfFile(cursor) {
    return !isEndOfFile(cursor);
}

function advanceIndex(cursor) {
    if (isNotEndOfFile(cursor)) {
        if (is(isEndOfLine)(cursor)) {
            return Record.set3
                ("indexX")(1)
                ("indexY")(cursor.indexY + 1)
                ("index")(cursor.index + 1)
                (cursor);
        } else {
            return Record.set2
                ("indexX")(cursor.indexX + 1)
                ("index")(cursor.index + 1)
                (cursor);
        }
    } else {
        return cursor;
    }
}

function markStartOfToken(cursor) {
    return Record.set3
        ("_indexXY")(cursor.index)
        ("x")(cursor.indexX)
        ("y")(cursor.indexY)
        (cursor);
}

function text(cursor) {
    return cursor.content.substr(cursor._indexXY, cursor.index - cursor._indexXY);
}


module.exports = {
    createCursor,
    charCodeAtIndex,
    is,
    isNot,
    isChar,
    isNotChar,
    isEndOfFile,
    isNotEndOfFile,
    advanceIndex,
    markStartOfToken,
    text
};