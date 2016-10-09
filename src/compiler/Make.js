"use strict";

const FS = require('fs');
const Path = require('path');

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
                .assign('ast', s => Parser.parseString(s.content))
                .assign('dirname', s => this.translateName(Path.dirname(scriptName)))
                .assign('_', s => {
                    mkdirp(s.dirname);
                    const astFileName = s.dirname + Path.sep + Path.basename(scriptName, '.sl') + '.ast';
                    writeFile(astFileName, JSON.stringify(s.ast, null, 2));
                })
                .assign('jsFileName', s => s.dirname + Path.sep + Path.basename(scriptName, '.sl') + '.js')
                .assign('js', s => Translator.astToJavascript(s.ast))
                .assign('_', s => writeFile(s.jsFileName, s.js));

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


module.exports = {
    Repository
};