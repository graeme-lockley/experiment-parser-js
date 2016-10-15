"use strict";

const Tuple = require('../../src/core/Tuple');
const Make = require('../../src/compiler/Make');

const expect = require('chai').expect;

describe('Make', () => {
    describe('A repository home', () => {
        const repositoryHome = '/home/user-name/.ml';
        const repository = new Make.Repository(repositoryHome);

       it('should map the file name onto a repository entry', () => {
           const scriptName = '/home/some-other-user/src/bob.ml';

           expect(repository.translateName(scriptName)).to.equal('/home/user-name/.ml/home/some-other-user/src/bob.ml');
       });
    });
});