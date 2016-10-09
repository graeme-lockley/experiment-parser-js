"use strict";

const Result = require('./core/Result');
const Sequence = require('./core/Sequence');
const Tuple = require('./core/Tuple');

const Make = require('./compiler/Make');


function parseCommandLine() {
    const argv = process.argv;

    if (argv.length <= 2) {
        return Result.Error("No file was provided for execution.");
    } else {
        const scriptName = argv[2].startsWith("/") ? argv[2] : process.cwd() + '/' + argv[2];

        return Result.Ok({
            script: scriptName,
            args: argv.slice(3)
        });
    }
}


function repositoryHomeFromEnvironment() {
    const home = process.env.HOME;

    if (home == undefined) {
        return Result.Error("Unable to calculate the repository home");
    } else {
        return Result.Ok(home + '/.sl');
    }
}


const result = Sequence.seq()
    .assign('cmdLine', s => parseCommandLine())
    .assign('repositoryHome', s => repositoryHomeFromEnvironment())
    .assign('repository', s => new Make.Repository(s.repositoryHome))
    .assign('fileName', s => s.repository.compile(s.cmdLine.script))
    .return(s => {
        const file = require(s.fileName);

        return Result.Ok(
            ('_$EXPR' in file) ? JSON.stringify(file['_$EXPR'])
                : ('main' in file) ? file['main'](cmdLine.args)
                : file);
    });

result
    .okay(success => console.log(success))
    .error(msg => console.log(msg));
