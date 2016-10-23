function isEndOfLine(c) {
    return c == 10;
}


function createCursor(context) {
    return {
        index: context.index,
        indexX: context.indexX,
        indexY: context.indexY,

        _indexXY: context.index,
        x: context.indexX,
        y: context.indexY,

        content: context.input.content,
        length: context.input.length,

    };
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
            cursor.indexX = 1;
            cursor.indexY += 1;
        } else {
            cursor.indexX += 1;
        }
        cursor.index += 1;
    }
}

function markStartOfToken(cursor) {
    cursor._indexXY = cursor.index;
    cursor.x = cursor.indexX;
    cursor.y = cursor.indexY;
}

function text(cursor) {
    return cursor.content.substr(cursor._indexXY, cursor.index - cursor._indexXY);
}

function clone(cursor) {
    var temp = cursor.constructor();
    for (var key in cursor) {
        if (cursor.hasOwnProperty(key)) {
            temp[key] = cursor[key];
        }
    }

    return temp;
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
    text,
    clone
};