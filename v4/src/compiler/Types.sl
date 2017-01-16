import file:./types/Infer as Infer;
import file:./types/Names as Names;
import file:./types/Schema as Schema;
import file:./types/Solver as Solver;
import file:./types/Type as Type;
import file:./types/TypeEnv as TypeEnv;

import file:./AST as AST;
import file:./TypeAST as TypeAST;

import file:../core/Debug as DEBUG;
import file:../core/Array as List;
import file:../core/Record as Record;
import file:../core/Result as Result;
import file:../core/Map as Map;
import file:../core/Maybe as Maybe;
import file:../core/Set as Set;
import file:../core/Tuple as Tuple;


inferModuleType ast =
    let {
        typeSignatureASTs =
            List.filter (\declarationAST -> declarationAST.type == "TYPE_SIGNATURE") ast.declarations;

        includeTypeSignature state signatureAST =
            Record.set2 "typeEnv" typeEnv "names" names state
                where {
                    fromASTResult =
                        fromAST signatureAST.value state.names;

                    names =
                        Tuple.second fromASTResult;

                    typeEnv =
                        TypeEnv.extend signatureAST.name (Tuple.first fromASTResult) state.typeEnv
                };

        stateWithTypeSignatures =
            List.foldl (\state \signatureAST -> includeTypeSignature state signatureAST) Infer.initialState typeSignatureASTs;

        adtDeclarations =
            List.filter (\declarationAST -> declarationAST.type == "ADT_DECLARATION") ast.declarations;

        stateWithADTSchemas =
            List.foldl (\state \adtDeclaration -> Record.set1 "typeEnv" (includeADTSchema adtDeclaration state.typeEnv) state) stateWithTypeSignatures adtDeclarations
    } in
        Result.andThen (Infer.infer ast stateWithADTSchemas) (\inferResult ->
            Result.andThen (Solver.unify (Record.get "constraints" (Tuple.second inferResult))) (\unifyResult ->
                Result.Ok resolvedSchemasWithExpr
                    where {
                        record =
                            Tuple.second inferResult;

                        resolvedSchemas =
                            record.typeEnv;

                        resolvedExpr =
                            resolveExpr (Tuple.first inferResult) unifyResult;

                        resolvedSchemasWithExpr =
                            includeExpr resolvedExpr resolvedSchemas
                    }
            )
        );


includeExpr =
    Map.insert "_$EXPR";


resolveExpr type =
    Schema.resolve (Schema.Forall List.empty type);


show schemas =
    List.join "\n" (List.map (\declaration -> (Tuple.first declaration) ++ " :: " ++ (Schema.show (Tuple.second declaration))) (Map.toList schemas));


fromAST ast names =
    let {
        fromASTp ast state =
            if ast.type == "CONSTANT" then
                let {
                    resolvedParametersResult =
                        List.foldr (\acc \item ->
                            Tuple.mapFirst (\x -> List.prepend x (Tuple.first acc)) (fromASTp item (Tuple.second acc))
                        ) (Tuple.Tuple List.empty state) ast.parameters;

                    resolvedParameters =
                        Tuple.first resolvedParametersResult;

                    resolvedState =
                        Tuple.second resolvedParametersResult
                } in
                    Tuple.Tuple (Type.TCon ast.name resolvedParameters) resolvedState

            else if ast.type == "FUNCTION" then
                let {
                    domainResult =
                        fromASTp ast.domain state;

                    domainType =
                        Tuple.first domainResult;

                    domainState =
                        Tuple.second domainResult;

                    rangeResult =
                        fromASTp ast.range domainState;

                    rangeType =
                        Tuple.first rangeResult;

                    rangeState =
                        Tuple.second rangeResult
                } in
                    Tuple.Tuple
                        (Type.TArr domainType rangeType) rangeState

            else
                let {
                    substitutionValue =
                        Map.find ast.name state.substitution
                } in
                    if Maybe.isJust substitutionValue then
                        Tuple.Tuple (Maybe.withDefault () substitutionValue) state
                    else
                        let {
                            nextNames =
                                Names.fresh state.names;

                            variableName =
                                Tuple.first nextNames;

                            newNamesState =
                                Tuple.second nextNames;

                            newType =
                                Type.TVar variableName;

                            newSubstitution =
                                Map.insert ast.name newType state.substitution
                        } in
                            Tuple.Tuple newType (mkState newNamesState newSubstitution);

        mkState names substitution =
            Record.mk2 "names" names "substitution" substitution
    } in
        Tuple.Tuple (Schema.Forall (Set.toList (Type.ftv type)) type) namesResult
            where {
                fromASTpResult =
                    fromASTp ast (mkState names Map.empty);

                type =
                    Tuple.first fromASTpResult;

                namesResult =
                    Record.get "names" (Tuple.second fromASTpResult)
            }
assumptions {
    DEBUG.eq (Tuple.first (fromAST (TypeAST.variable "x") Names.initial)) (Schema.Forall (List.singleton "a1") (Type.TVar "a1"));
    DEBUG.eq (Tuple.first (fromAST (TypeAST.constant "Integer" List.empty) Names.initial)) (Schema.Forall List.empty (Type.TCon "Integer" List.empty));
    DEBUG.eq (Tuple.first (fromAST (TypeAST.functionArrow (TypeAST.variable "x") (TypeAST.variable "x")) Names.initial)) (Schema.Forall (List.singleton "a1") (Type.TArr (Type.TVar "a1") (Type.TVar "a1")));
    DEBUG.eq (Tuple.first (fromAST (TypeAST.functionArrow (TypeAST.variable "x") (TypeAST.constant "List" (List.singleton (TypeAST.variable "x")))) Names.initial)) (Schema.Forall (List.singleton "a1") (Type.TArr (Type.TVar "a1") (Type.TCon "List" (List.singleton (Type.TVar "a1")))));
    DEBUG.eq (Tuple.first (fromAST (TypeAST.constant "List" (List.singleton (TypeAST.variable "x"))) Names.initial)) (Schema.Forall (List.singleton "a1") (Type.TCon "List" (List.singleton (Type.TVar "a1"))));
    DEBUG.eq
        (Tuple.first (fromAST (TypeAST.functionArrow (TypeAST.variable "x") (TypeAST.functionArrow (TypeAST.constant "List" (List.singleton (TypeAST.variable "x"))) (TypeAST.constant "List" (List.singleton (TypeAST.variable "x"))))) Names.initial))
        (Schema.Forall (List.singleton "a1") (Type.TArr (Type.TVar "a1") (Type.TArr (Type.TCon "List" (List.singleton (Type.TVar "a1"))) (Type.TCon "List" (List.singleton (Type.TVar "a1"))))))
};


typeFromAST typeAST =
    Tuple.first (fromAST typeAST Names.initial);


testListADTDeclaration =
    AST.adtDeclaration "List" (List.singleton "a") (List.mk2
        (Tuple.Tuple "Cons" (List.mk2 (TypeAST.variable "a") (TypeAST.constant "List" (List.singleton (TypeAST.variable "a")))))
        (Tuple.Tuple "Nil" List.empty)
    );


adtTypeAST adtDeclarationAST =
    TypeAST.constant adtDeclarationAST.name (List.map TypeAST.variable adtDeclarationAST.parameters)
assumptions {
    DEBUG.eq (adtTypeAST testListADTDeclaration) (TypeAST.constant "List" (List.singleton (TypeAST.variable "a")))
};


adtConstructorType constructorAST adtType =
    typeFromAST (List.foldr (\item \type -> Type.TArr type item) adtType (Tuple.second constructorAST))
assumptions {
    DEBUG.eq
        (adtConstructorType (at 0 (testListADTDeclaration.constructors)) (TypeAST.constant "List" (List.singleton (TypeAST.variable "a"))))
        (Schema.Forall (List.singleton "a1") (Type.TArr (Type.TVar "a1") (Type.TArr (Type.TCon "List" (List.singleton (Type.TVar "a1"))) (Type.TCon "List" (List.singleton (Type.TVar "a1"))))));
    DEBUG.eq
        (adtConstructorType (at 1 (testListADTDeclaration.constructors)) (TypeAST.constant "List" (List.singleton (TypeAST.variable "a"))))
        (Schema.Forall (List.singleton "a1") (Type.TCon "List" (List.singleton (Type.TVar "a1"))))
};


includeADTSchema adtDeclarationAST typeEnv =
    let {
        adtT =
            adtTypeAST adtDeclarationAST
    } in
        List.foldl (\typeEnv \constructorAST ->
            let {
                constructorType =
                    adtConstructorType constructorAST adtT
            } in
                TypeEnv.extend (Tuple.first constructorAST) constructorType typeEnv) typeEnv adtDeclarationAST.constructors
assumptions {
    DEBUG.eq
        (includeADTSchema testListADTDeclaration TypeEnv.empty)
        (TypeEnv.extend "Nil" (Schema.Forall (List.singleton "a1") (Type.TCon "List" (List.singleton (Type.TVar "a1"))))
            (TypeEnv.extend "Cons" (Schema.Forall (List.singleton "a1") (Type.TArr (Type.TVar "a1") (Type.TArr (Type.TCon "List" (List.singleton (Type.TVar "a1"))) (Type.TCon "List" (List.singleton (Type.TVar "a1"))))))
                TypeEnv.empty))
};


at i a =
    Maybe.withDefault () (List.at i a);
