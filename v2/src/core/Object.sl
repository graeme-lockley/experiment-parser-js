import file:./ObjectHelper as Helper;

import file:./Debug as DEBUG;


eq l r =
    if (Helper.objectEquals l r) then
        true
    else {
        DEBUG.log "Expected" l;
        DEBUG.log "   to eq" r;
        false
    };


neq l r =
    if !(Helper.objectEquals l r) then
        true
    else {
        DEBUG.log "Expected" l;
        DEBUG.log "  to !eq" r;
        false
    };
