"use strict";

const FS = require('fs');
const Path = require('path');

const Parser = require('./Parser');
const Translator = require('./Translator');


class Repository {
    constructor(home) {
        this.home = home;
    }

    compile(scriptName) {
        if (scriptName.endsWith('.sl')) {

            const content = FS.readFileSync(scriptName).toString();

            const ast = Parser.parseString(content);

            const dirname = this.translateName(Path.dirname(scriptName));
            mkdirp(dirname);
            const astFileName = dirname + Path.sep + Path.basename(scriptName, '.sl') + '.ast';
            FS.writeFileSync(astFileName, JSON.stringify(ast, null, 2));
            const jsFileName = dirname + Path.sep + Path.basename(scriptName, '.sl') + '.js';

            FS.writeFileSync(jsFileName, Translator.astToJavascript(ast.getOkOrElse()));

            ast.okay(module => module.imports.forEach(i => {
                this.compile(composeScriptNameFromURL(scriptName, i.url.value));
            }));

            return jsFileName;
        } else if (scriptName.endsWith('.js')) {
            const content = FS.readFileSync(scriptName).toString();

            const dirname = this.translateName(Path.dirname(scriptName));
            mkdirp(dirname);
            const jsFileName = dirname + Path.sep + Path.basename(scriptName);
            FS.writeFileSync(jsFileName, content);

            return jsFileName;
        } else if (fileExists(scriptName + '.sl')) {
           return this.compile(scriptName + '.sl');
        } else if (fileExists(scriptName + '.js')) {
           return this.compile(scriptName + '.js');
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