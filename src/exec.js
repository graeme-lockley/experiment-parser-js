"use strict";

const Result = require('./core/Result');
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


parseCommandLine()
    .okay(cmdLine => {
        repositoryHomeFromEnvironment()
            .okay(repositoryHome => {
                const repository = new Make.Repository(repositoryHome);

                const fileName = repository.compile(cmdLine.script);

                const file = require(fileName);

                if ('_$EXPR' in file) {
                    console.log(file['_$EXPR']);
                } else if ('main' in file) {
                    console.log(file['main'](cmdLine.args));
                } else {
                    console.log(file);
                }
            })
            .error(msg => {
                console.log(msg);
            });
    })
    .error(msg => {
        console.log(msg);
    });