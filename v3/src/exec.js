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


function executeTests(tests) {
    let testCount = 0;
    let successCount = 0;

    for (let test of tests) {
        for (let declaration of test.declarations) {
            for (let predicate of declaration.predicates) {
                testCount += 1;
                try {
                    if (predicate.predicate()) {
                        successCount += 1;
                    } else {
                        console.log('Fail: ' + predicate.source + ': ' + predicate.line + ': ' + predicate.text);
                    }
                } catch (e) {
                    console.log('Error:' + e + ': ' + predicate.source + ': ' + predicate.line + ': ' + predicate.text);
                }
            }
        }
    }

    console.log('Success: ' + successCount + '/' + testCount);

    return successCount == testCount;
}


const result = Sequence.seq()
    .assign('cmdLine', s => parseCommandLine())
    .assign('repositoryHome', s => repositoryHomeFromEnvironment())
    .assign('repository', s => new Make.Repository(s.repositoryHome))
    .assign('fileName', s => s.repository.compile(s.cmdLine.script))
    .assign('result', s => {
            const file = require(s.fileName);

            if (executeTests(file._$ASSUMPTIONS)) {
                return ('_$EXPR' in file) ? JSON.stringify(file['_$EXPR'])
                    : ('main' in file) ? file['main'](s.cmdLine.args)
                    : file;
            } else {
                return Result.Error('Assumptions failed');
            }
        },
        s => 'Executing script'
    )
    .return(s => s.result);

console.log(result);
