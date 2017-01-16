import file:./../../core/Array as List;
import file:./../../core/Map as Map;
import file:./../../core/Set as Set;

import file:./Type as Type;


apply subst type =
    if Type.isTCon type then
        Type.TCon type.name (List.map (apply subst) type.variables)
    else if Type.isTVar type then
        Map.findWithDefault type type.name subst
    else
        Type.TArr (apply subst domain) (apply subst range)
            where {
                domain = type.domain;
                range = type.range
            };
