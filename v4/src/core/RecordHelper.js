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


function mk6(k1) {
    return v1 => k2 => v2 => k3 => v3 => k4 => v4 => k5 => v5 => k6 => v6 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        result[k4] = v4;
        result[k5] = v5;
        result[k6] = v6;
        return result;
    };
}


function mk7(k1) {
    return v1 => k2 => v2 => k3 => v3 => k4 => v4 => k5 => v5 => k6 => v6 => k7 => v7 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        result[k4] = v4;
        result[k5] = v5;
        result[k6] = v6;
        result[k7] = v7;
        return result;
    };
}


function mk8(k1) {
    return v1 => k2 => v2 => k3 => v3 => k4 => v4 => k5 => v5 => k6 => v6 => k7 => v7 => k8 => v8 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        result[k4] = v4;
        result[k5] = v5;
        result[k6] = v6;
        result[k7] = v7;
        result[k8] = v8;
        return result;
    };
}


function mk9(k1) {
    return v1 => k2 => v2 => k3 => v3 => k4 => v4 => k5 => v5 => k6 => v6 => k7 => v7 => k8 => v8 => k9 => v9 => {
        const result = {};
        result[k1] = v1;
        result[k2] = v2;
        result[k3] = v3;
        result[k4] = v4;
        result[k5] = v5;
        result[k6] = v6;
        result[k7] = v7;
        result[k8] = v8;
        result[k9] = v9;
        return result;
    };
}


function union(a) {
    return b => {
        const result = clone(b);

        for (const key in a) {
            if (a.hasOwnProperty(key)) {
                result[key] = a[key];
            }
        }

        return result;
    }
}


function clone(record) {
    const temp = record.constructor();
    for (const key in record) {
        if (record.hasOwnProperty(key)) {
            temp[key] = record[key];
        }
    }

    return temp;
}


function fold(f) {
    return z => r => {
        let result = z;

        for (const key in r) {
            if (r.hasOwnProperty(key)) {
                result = f(result)(key)(r[key]);
            }
        }

        return result;
    };
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
    mk5,
    mk6,
    mk7,
    mk8,
    mk9,
    union,
    fold
};