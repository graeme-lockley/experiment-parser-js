"use strict";


function get(name) {
    return d => d[name];
}


function mk0() {
    return {};
}


function set1(k1) {
    return v1 => record => {
        const result = clone(record);
        result[k1] = v1;
        return result;
    };
}


function set2(k1) {
    return v1 => k2 => v2 => record => {
        const result = clone(record);
        result[k1] = v1;
        result[k2] = v2;
        return result;
    };
}


function set3(k1) {
    return v1 => k2 => v2 => k3 => v3 => record => {
        const result = clone(record);
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        return result;
    };
}


function mk1(k1) {
    return v1 => {
        const result = {};
        result[k1] = v1;
        return result;
    };
}


function mk2(k1) {
    return v1 => k2 => v2 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        return result;
    };
}


function mk3(k1) {
    return v1 => k2 => v2 => k3 => v3 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        return result;
    };
}


function mk4(k1) {
    return v1 => k2 => v2 => k3 => v3 => k4 => v4 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        result[k4] = v4;
        return result;
    };
}


function mk5(k1) {
    return v1 => k2 => v2 => k3 => v3 => k4 => v4 => k5 => v5 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        result[k4] = v4;
        result[k5] = v5;
        return result;
    };
}


function clone(record) {
    var temp = record.constructor();
    for (var key in record) {
        if (record.hasOwnProperty(key)) {
            temp[key] = record[key];
        }
    }

    return temp;
}


module.exports = {
    get,
    set1,
    set2,
    set3,
    mk0,
    mk1,
    mk2,
    mk3,
    mk4,
    mk5
};