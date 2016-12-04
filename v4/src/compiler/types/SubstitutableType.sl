import file:./../../core/Map as Map;
import file:./../../core/Set as Set;

import file:./Type as Type;


apply subst type =
    if Type.isTCon type then
        type
    else if Type.isTVar type then
        Map.findWithDefault type type.name subst
    else
        apply subst (Type.TArr domain (apply subst range))
            where {
                domain = type.domain;
                range = type.range
            };


ftv type =
    if Type.isTCon type then
        Set.empty
    else if Type.isTVar then
        Set.singleton type.name
    else
        Set.union (ftv type.domain) (ftv type.range);
