import file:./DebugHelper as Helper;

import file:./Object as Object;


log label value =
    Helper.log label value;


eq l r =
    if (Object.eq l r) then
        true
    else {
        DEBUG.log "Expected" l;
        DEBUG.log "   to eq" r;
        false
    };


neq l r =
    if (Object.neq l r) then
        true
    else {
        DEBUG.log "Expected" l;
        DEBUG.log "  to !eq" r;
        false
    };
