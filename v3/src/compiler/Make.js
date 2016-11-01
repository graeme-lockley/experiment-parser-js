"use strict";

const FS = require('fs');
const Path = require('path');
const {NodeVM} = require('vm2');


const Parser = require('./Parser');
const Translator = require('./Translator');

const Sequence = require('../core/Sequence');
const Result = require('../core/Result');


class Repository {
    constructor(home) {
        this.home = home;
    }

    compile(scriptName) {
        if (scriptName.endsWith('.sl')) {
            const seq = Sequence.seq()
                .assign('content', s => readFile(scriptName))
                .assign('ast', s => Parser.parseString(s.content)(scriptName), s => 'Parsing ' + scriptName)
                .assign('dirname', s => this.translateName(Path.dirname(scriptName)))
                .assign('_', s => {
                    mkdirp(s.dirname);
                    const astFileName = s.dirname + Path.sep + Path.basename(scriptName, '.sl') + '.ast';
                    writeFile(astFileName, JSON.stringify(s.ast, null, 2));
                })
                .assign('jsFileName', s => s.dirname + Path.sep + Path.basename(scriptName, '.sl') + '.js')
                .assign('js', s => Translator.astToJavascript(s.ast)(0), s => 'Translating ' + scriptName)
                .assign('_', s => writeFile(s.jsFileName, s.js), s => 'Writing ' + s.jsFileName);

            const ast = seq.return(s => s.ast);
            ast.okay(module => module.imports.forEach(i => {
                seq.assign('_', s => this.compile(composeScriptNameFromURL(scriptName, i.url.value)));
            }));

            return seq.return(s => s.jsFileName);
        } else if (scriptName.endsWith('.js')) {
            return Sequence.seq()
                .assign('content', s => readFile(scriptName))
                .assign('dirname', s => this.translateName(Path.dirname(scriptName)))
                .assign('_', s => mkdirp(s.dirname))
                .assign('jsFileName', s => s.dirname + Path.sep + Path.basename(scriptName))
                .assign('_', s => writeFile(s.jsFileName, s.content))
                .return(s => s.jsFileName);
        } else if (fileExists(scriptName + '.sl')) {
            return this.compile(scriptName + '.sl');
        } else if (fileExists(scriptName + '.js')) {
            return this.compile(scriptName + '.js');
        } else {
            return Result.Error('File ' + scriptName + ' does not exist');
        }
    }

    build(options, files) {
        const sourceDir = simplifyPath(options.srcDir || './src');
        const outputDir = simplifyPath(options.outputDir || './output');

        const testFileNames = {};

        files.forEach(file => {
            const fileSourceDir = simplifyPath(file.startsWith('/') ? file : sourceDir + '/' + file);

            function walk(d) {
                FS.readdirSync(d).forEach(sourceFile => {
                    const fileName = d + '/' + sourceFile;
                    if (fileName.endsWith('.sl')) {
                        const targetFileName = (n => n.substring(0, n.length - 3) + '.js')(mapToOutputFileName(sourceDir, outputDir, fileName));

                        console.log(`Compiling: ${fileName}`);
                        const content = readFile(fileName);

                        const astResult = Parser.parseString(content)(fileName);
                        if (Result.isOk(astResult)) {
                            const translationResult = Translator.astToJavascript(Result.withDefault()(astResult))(0);
                            writeFile(targetFileName, translationResult);

                            testFileNames[targetFileName] = true;
                        } else {
                            console.log(`Parsing error: ${fileName}: ${Result.errorWithDefault()(astResult)}`);
                            return astResult;
                        }
                    } else {
                        if (fileExists(fileName)) {
                            const content = readFile(fileName);
                            const outputFileName = mapToOutputFileName(sourceDir, outputDir, fileName);
                            writeFile(outputFileName, content);
                        } else if (dirExists(fileName)) {
                            walk(fileName);
                        } else {
                            console.log(`skipping ${sourceFile}`);
                        }
                    }
                });
            }

            walk(fileSourceDir);
        });


        const haveRun = {};
        let testCount = 0;
        let testPassed = 0;
        for (var testFileName in testFileNames) {
            const vm = new NodeVM({
                console: 'inherit',
                sandbox: {},
                require: {
                    external: true
                },
                wrapper: 'none',
            });

            vm.run('const x = require("' + testFileName + '");\n return x._$ASSUMPTIONS;', process.cwd() + '/stream.js').forEach(module => {
                if (!(module.source in haveRun)) {
                    console.log(module.source);
                    module.declarations.forEach(declaration => {
                        console.log(`  ${declaration.name}`);
                        declaration.predicates.forEach(predicate => {
                            testCount += 1;
                            try {
                                if (predicate.predicate()) {
                                    console.log(`    Passed: ${predicate.line}: ${predicate.text}`);
                                    testPassed += 1;
                                } else {
                                    console.log(`    Failed: ${predicate.line}: ${predicate.text}`);
                                }
                            } catch (e) {
                                console.log(`    Error: ${predicate.line}: ${predicate.text}: ${e}`);
                            }
                        });
                    });
                    haveRun[module.source] = true;
                }
            });
        }

        return {
            totalModules: Object.keys(testFileNames).length,
            numberTests: testCount,
            passed: testPassed,
            failed: testCount - testPassed
        };
    }

    translateName(scriptName) {
        return this.home + scriptName;
    }
}


function composeScriptNameFromURL(scriptName, url) {
    const urlSuffix = url.startsWith('file:') ? url.substring(5) : url;

    return Path.dirname(scriptName) + Path.sep + urlSuffix;
}


function readFile(fileName) {
    return FS.readFileSync(fileName).toString();
}


function writeFile(fileName, content) {
    mkdirp(Path.dirname(fileName));
    FS.writeFileSync(fileName, content);
}

function mkdirp(directoryName) {
    try {
        if (!dirExists(directoryName)) {
            mkdirp(Path.dirname(directoryName));
            FS.mkdirSync(directoryName);
        }
    } catch (e) {
        // do nothing...
    }
}


function dirExists(directoryName) {
    try {
        const stats = FS.statSync(directoryName);

        return stats.isDirectory();
    } catch (e) {
        return false;
    }
}


function fileExists(fileName) {
    try {
        const stats = FS.statSync(fileName);

        return stats.isFile();
    } catch (e) {
        return false;
    }
}

function simplifyPath(path) {
    let candidateResult = path;
    while (true) {
        const result = candidateResult.replace('/./', '/').replace('//', '/');
        if (result == candidateResult) {
            if (result.endsWith('/.')) {
                return result.substring(0, result.length - 2);
            } else {
                return result;
            }
        } else {
            candidateResult = result;
        }
    }
}

function mapToOutputFileName(srcDir, outputDir, fileName) {
    let result = '';
    if (fileName.startsWith(fileName)) {
        result = simplifyPath(outputDir + '/' + fileName.substring(srcDir.length));
    } else {
        result = simplifyPath(outputDir + '/' + fileName);
    }
    // console.log(`mapToOutputFileName(${srcDir}, ${outputDir}, ${fileName}) -> [${result}]`);
    return result;
}


module.exports = {
    Repository
};