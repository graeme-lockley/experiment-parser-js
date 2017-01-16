import file:./Subst as Subst;
import file:./Type as Type;

import file:../../core/Array as List;
import file:../../core/Debug as DEBUG;
import file:../../core/Map as Map;
import file:../../core/Record as Record;
import file:../../core/Set as Set;


Forall names type =
    Record.mk2 "names" names "type" type;


names schema =
    schema.names
assumptions {
    names (Forall "1" "2") == "1"
};


type schema =
    schema.type
assumptions {
    type (Forall "1" "2") == "2"
};


resolve schema subst =
    let {
        mkTriple type count mapOfNames =
            Record.mk3 "type" type "count" count "mapOfNames" mapOfNames;

        resolvep t =
            let {
                type =
                    t.type
            } in
                if Type.isTCon type then
                    t
                else if Type.isTVar type then
                    if Subst.has type.name subst then
                        resolvep (Record.set1 "type" (Subst.apply type.name subst) t)
                    else
                        if Map.contains type.name t.mapOfNames then
                            Record.set1 "type" (Map.findWithDefault () type.name t.mapOfNames) t
                        else
                            mkTriple newType (t.count + 1) (Map.insert type.name newType t.mapOfNames)
                                where {
                                    newName =
                                        "a" ++ (t.count);

                                    newType =
                                        Type.TVar newName
                                }
                else
                    Record.set1 "type" (Type.TArr domain.type range.type) range
                        where {
                            domain =
                                resolvep (Record.set1 "type" type.domain t);

                             range =
                                resolvep (Record.set1 "type" type.range domain)
                        };

        resolvePOnType =
            resolvep (mkTriple schema.type 1 Map.empty);

        freeVariables count =
            if count == 1 then
                List.empty
            else
                List.append ("a" ++ lessCount) (freeVariables lessCount)
                    where {
                        lessCount =
                            count - 1
                    }
    } in
        Forall (freeVariables resolvePOnType.count) resolvePOnType.type
assumptions {
    DEBUG.eq (resolve (Forall List.empty Type.typeString) Subst.nullSubst) (Forall List.empty Type.typeString);
    DEBUG.eq (resolve (Forall List.empty (Type.TVar "a9")) Subst.nullSubst) (Forall (List.singleton "a1") (Type.TVar "a1"));
    DEBUG.eq (resolve (Forall List.empty (Type.TVar "a9")) (Subst.add "a9" Type.typeString Subst.nullSubst)) (Forall List.empty Type.typeString);
    DEBUG.eq (resolve (Forall List.empty (Type.TVar "a9")) (Subst.add "a9" (Type.TVar "a11") Subst.nullSubst)) (Forall (List.singleton "a1") (Type.TVar "a1"));
    DEBUG.eq (resolve (Forall List.empty (Type.TArr (Type.TVar "a9") Type.typeInteger)) (Subst.add "a9" (Type.TVar "a11") Subst.nullSubst)) (Forall (List.singleton "a1") (Type.TArr (Type.TVar "a1") Type.typeInteger))
};


show schema =
    (Type.show schema.type)
assumptions {
    (show (Forall (List.empty) (Type.TArr Type.typeInteger Type.typeString))) == "Integer -> String";
    (show (Forall (List.mk2 "a" "b") (Type.TArr (Type.TVar "a") (Type.TVar "b")))) == "a -> b"
};