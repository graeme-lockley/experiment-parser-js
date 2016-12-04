import file:./Schema as Schema;

import file:./../../core/Map as Map;


empty =
    Map.empty;


extend name schema typeEnv =
    Map.insert name schema typeEnv;