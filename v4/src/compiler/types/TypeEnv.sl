import file:./Schema as Schema;

import file:./../../core/Map as Map;


empty =
    Map.empty;


extend name schema typeEnv =
    Map.insert name schema typeEnv;


remove name typeEnv =
    Map.remove name typeEnv;


find name typeEnv =
    Map.find name typeEnv;



ftv typeEnv =
    Map.keys typeEnv;