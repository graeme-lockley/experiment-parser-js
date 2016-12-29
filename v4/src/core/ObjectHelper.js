'use strict';


function objectEquals(x) {
    return y => {
        return show(x) == show(y);
    }
}


function show(o, indent = 0, inMap = false) {
    const typeOfO = typeof o;

    if (typeOfO == "string") {
        return nspaces(indent, inMap) + '"' + o.replace(/\\/g, '\\\\').replace(/\n/g, "\\n").replace(/"/g, '\\"') + '"';
    } else if (typeOfO == "number") {
        return nspaces(indent, inMap) + o;
    } else if (typeOfO == "boolean") {
        return nspaces(indent, inMap) + o;
    } else if (typeOfO == "symbol") {
        return nspaces(indent, inMap) + o;
    } else if (typeOfO == "undefined") {
        return nspaces(indent, inMap) + "undefined";
    } else if (typeOfO == "object") {
        if (o == null) {
            return nspaces(indent, inMap) + "null";
        } else if (Array.isArray(o)) {
            let result = nspaces(indent, inMap) + "[";
            let isFirst = true;
            for (const v in o) {
                if (isFirst) {
                    isFirst = false;
                } else {
                    result = result + ",";
                }
                result = result + "\n" + show(o[v], indent + 1, false);
            }
            if (isFirst) {
                return result + "]";
            } else {
                return result + "\n" + nspaces(indent, false) + "]";
            }
        } else if (o instanceof Set) {
            let result = nspaces(indent, inMap) + "{";
            let isFirst = true;
            let oArray = Array.from(o);
            oArray.sort();
            for (const v in oArray) {
                if (isFirst) {
                    isFirst = false;
                } else {
                    result = result + ",";
                }
                result = result + "\n" + show(oArray[v], indent + 1, false);
            }
            if (isFirst) {
                return result + "}";
            } else {
                return result + "\n" + nspaces(indent, false) + "}";
            }
        } else if (o instanceof Date) {
            return nspaces(indent, inMap) + o;
        } else {
            let result = nspaces(indent, inMap) + "{";
            let isFirst = true;
            for (const v in o) {
                if (o.hasOwnProperty(v)) {
                    if (isFirst) {
                        isFirst = false;
                    } else {
                        result = result + ",";
                    }
                    result = result + "\n" + nspaces(indent + 1, false) + '"' + v + '":' + show(o[v], indent + 1, true);
                }
            }
            if (isFirst) {
                return result + "}";
            } else {
                return result + "\n" + nspaces(indent, false) + "}";
            }
        }
    } else if (typeOfO == "function") {
        return nspaces(indent, inMap) + "function";
    } else {
        return nspaces(indent, inMap) + "unknown: " + o;
    }
}


function nspaces(n, inMap, width = 2) {
    if (inMap) {
        return " ";
    } else {
        let result = "";
        const upper = n * width;
        for (let lp = 0; lp < upper; lp += 1) {
            result = result + " ";
        }
        return result;
    }
}


module.exports = {
    objectEquals,
    show
};