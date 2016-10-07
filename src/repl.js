"use script";

const NodeREPL = require('repl');
const VM = require('vm');

const Array = require('./core/Array');
const Parser = require('./Parser');
const Translator = require('./Translator');


function runInContext(js, context, fileName) {
    return (context == global)
        ? VM.runInThisContext(js, fileName)
        : VM.runInContext(js, context, fileName);
}


let state = {
    mode: 'ss',
    eval: safeScriptEval,
    showAST: false,
    showTranslatedSafeScript: false
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

repl.defineCommand('ss', {
    help: 'Set the repl to accept SafeScript instructions',
    action: () => {
        repl.setPrompt('ss> ');
        state.eval = safeScriptEval;
        console.log('Mode set to SafeScript');
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
            state.showTranslatedSafeScript = true;
            console.log('Show translated SafeScript enabled');
        } else if (name == 'js=off') {
            state.showTranslatedSafeScript = false;
            console.log('Show translated SafeScript disabled');
        } else {
            if (name != '') {
                console.error('Unknown setting instruction: ' + name);
            }
            console.log('ast: ' + (state.showAST ? 'on' : 'off'));
            console.log('js: ' + (state.showTranslatedSafeScript ? 'on' : 'off'));
        }
        repl.displayPrompt();
    }
});


function javaScriptEval(input, context, filename, cb) {
    cb(null, runInContext(input, context, filename));
}


function safeScriptEval(input, context, filename, cb) {
    const parsedResponse = Parser.parseString(input);

    if (parsedResponse.isOk()) {
        if (state.showAST) {
            console.log('--- AST ---');
            console.log(JSON.stringify(parsedResponse.getOkOrElse(), null, 2));
            console.log('-----------');
        }

        const jsText = Translator.astToJavascript(parsedResponse.getOkOrElse());

        if (state.showTranslatedSafeScript) {
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
        prompt: 'ss> ',
        eval: (input, context, filename, cb) => {
            state.eval(input, context, filename, cb);
        }
    });
}
