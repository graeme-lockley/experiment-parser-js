"use strict";

const NodeREPL = require('repl');
const VM = require('vm');

const Parser = require('./compiler/Parser');
const Translator = require('./compiler/Translator');

const Result = require('./core/Result.sl');


function runInContext(js, context, fileName) {
    return (context == global)
        ? VM.runInThisContext(js, fileName)
        : VM.runInContext(js, context, fileName);
}


let state = {
    mode: 'sl',
    eval: safeLangEval,
    showAST: false,
    showTranslatedSafeLang: false
};


const repl = createRepl();


repl.defineCommand('js', {
    help: 'Set the repl to accept JavaScript instructions',
    action: () => {
        repl.setPrompt('js> ');
        state.eval = javaScriptEval;
        console.log('Mode set to JavaScript');
        repl.displayPrompt();
    }
});

repl.defineCommand('sl', {
    help: 'Set the repl to accept SafeLang instructions',
    action: () => {
        repl.setPrompt('sl> ');
        state.eval = safeLangEval;
        console.log('Mode set to SafeLang');
        repl.displayPrompt();
    }
});

repl.defineCommand('set', {
    help: 'Enable or disable settings: ast, js',
    action: name => {
        if (name == 'ast=on') {
            state.showAST = true;
            console.log('Show AST enabled');
        } else if (name == 'ast=off') {
            state.showAST = false;
            console.log('Show AST disabled');
        } else if (name == 'js=on') {
            state.showTranslatedSafeLang = true;
            console.log('Show translated SafeLang enabled');
        } else if (name == 'js=off') {
            state.showTranslatedSafeLang = false;
            console.log('Show translated SafeLang disabled');
        } else {
            if (name != '') {
                console.error('Unknown setting instruction: ' + name);
            }
            console.log('ast: ' + (state.showAST ? 'on' : 'off'));
            console.log('js: ' + (state.showTranslatedSafeLang ? 'on' : 'off'));
        }
        repl.displayPrompt();
    }
});


function javaScriptEval(input, context, filename, cb) {
    cb(null, runInContext(input, context, filename));
}


function safeLangEval(input, context, filename, cb) {
    const parsedResponse = Parser.parseString(input);

    if (Result.isOk(parsedResponse)) {
        if (state.showAST) {
            console.log('--- AST ---');
            console.log(JSON.stringify(Result.withDefault()(parsedResponse), null, 2));
            console.log('-----------');
        }

        const jsText = Translator.astToJavascript(Result.withDefault()(parsedResponse));

        if (state.showTranslatedSafeLang) {
            console.log('--- JavaScript ---');
            console.log(jsText);
            console.log('------------------');
        }

        cb(null, runInContext(jsText, context, filename));
    } else {
        cb(parsedResponse.getErrorOrElse());
    }
}


function createRepl() {
    return NodeREPL.start({
        prompt: 'sl> ',
        eval: (input, context, filename, cb) => {
            state.eval(input, context, filename, cb);
        }
    });
}
