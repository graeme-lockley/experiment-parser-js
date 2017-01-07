import file:../../core/Tuple as Tuple;


initial =
    0;


fresh names =
    Tuple.Tuple ("a" ++ nextName) nextName
        where {
            nextName =
                names + 1
        };

