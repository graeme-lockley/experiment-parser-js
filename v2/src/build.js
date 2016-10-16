"use strict";

const Result = require('./core/Result');
const Sequence = require('./core/Sequence');
const Tuple = require('./core/Tuple');

const Make = require('./compiler/Make');


function parseCommandLine() {
    const argv = process.argv;

    const options = {};

    let loop = 2;
    while (true) {
        if (loop >= argv.length) {
            return Result.Error("No file was provided for execution");
        } else if (argv[loop].startsWith("--")) {
            const option = splitOnFirstEqual(argv[loop].substring(2));

            options[option[0]] = option[1];
        } else {
            return Result.Ok({
                options: options,
                files: argv.slice(loop)
            });
        }

        loop += 1;
    }
}


function splitOnFirstEqual(s) {
    let index = s.indexOf('=');

    if (index == -1) {
        return [s, ''];
    } else {
        return [s.substring(0, index), s.substring(index + 1)];
    }
}


const result = Sequence.seq()
    .assign('cmdLine', s => parseCommandLine())
    .assign('repositoryHome', s => s.cmdLine.options.outputDir || './output')
    .assign('repository', s => new Make.Repository(s.repositoryHome))
    .assign('result', s => s.repository.build(s.cmdLine.options, s.cmdLine.files))
    .return(s => s.result);

console.log(result);
