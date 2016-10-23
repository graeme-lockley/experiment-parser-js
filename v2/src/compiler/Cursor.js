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

        charCodeAtIndex: function () {
            return this.content.charCodeAt(this.index);
        },

        is: function (predicate) {
            return this.isNotEndOfFile() && predicate(this.charCodeAtIndex());
        },
        isNot: function (predicate) {
            return this.isNotEndOfFile() && !predicate(this.charCodeAtIndex());
        },
        isChar: function (c) {
            return this.isNotEndOfFile() && this.charCodeAtIndex() == c.charCodeAt(0);
        },
        isNotChar: function (c) {
            return this.isNotEndOfFile() && this.charCodeAtIndex() != c.charCodeAt(0);
        },
        isEndOfFile: function () {
            return this.index >= this.length;
        },
        isNotEndOfFile: function () {
            return !this.isEndOfFile();
        },
        advanceIndex: function () {
            if (this.isNotEndOfFile()) {
                if (this.is(isEndOfLine)) {
                    this.indexX = 1;
                    this.indexY += 1;
                } else {
                    this.indexX += 1;
                }
                this.index += 1;
            }
        },
        markStartOfToken: function () {
            this._indexXY = this.index;
            this.x = this.indexX;
            this.y = this.indexY;
        },
        text: function () {
            return this.content.substr(this._indexXY, this.index - this._indexXY);
        },
        clone: function () {
            var temp = this.constructor();
            for (var key in this) {
                if (this.hasOwnProperty(key)) {
                    temp[key] = this[key];
                }
            }

            return temp;
        }
    };
}


module.exports = {
    createCursor
};