import file:./types/Infer as Infer;
import file:./types/Schema as Schema;
import file:./types/Solver as Solver;

import file:../core/Debug as DEBUG;
import file:../core/Array as List;
import file:../core/Record as Record;
import file:../core/Result as Result;
import file:../core/Map as Map;
import file:../core/Tuple as Tuple;


inferModuleType ast =
    Result.andThen (Infer.infer ast Infer.initialState) (\inferResult ->
        Result.andThen (Solver.unify (Record.get "constraints" (Tuple.second inferResult))) (\unifyResult ->
            Result.Ok resolvedSchemasWithExpr
                where {
                    record =
                        Tuple.second inferResult;

                    resolvedSchemas =
                        Map.map (\schema -> Schema.resolve schema unifyResult) record.typeEnv;

                    resolvedExpr =
                        resolveExpr (Tuple.first inferResult) unifyResult;

                    resolvedSchemasWithExpr =
                        includeExpr resolvedExpr resolvedSchemas
                }
        )
    );


includeExpr schema schemaResults =
    Map.insert "_$EXPR" schema schemaResults;


resolveExpr type unifyResult =
    Schema.resolve (Schema.Forall List.empty type) unifyResult;


show schemas =
    List.join "\n" (List.map (\declaration -> (Tuple.first declaration) ++ " :: " ++ (Schema.show (Tuple.second declaration))) (Map.toList schemas));