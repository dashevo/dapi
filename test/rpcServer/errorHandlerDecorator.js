const chai = require('chai');
const errorHandlerDecorator = require('../../lib/rpcServer/errorHandlerDecorator');

const {expect} = chai;

describe('lib/rpcServer/errorHandlerDecorator', () => {
    it('should be errorHandlerDecorator function', () => {
        const res = errorHandlerDecorator;
        expect(res).to.be.a('function');
    });
    it('should updateUsernameIndex return function', () => {
        const res = errorHandlerDecorator();
        expect(res).to.be.a('function');
    });
    it('should throw error when call errorHandlerDecorator with non existing command', () => {
        const res = errorHandlerDecorator('fake');
        expect(() => res('my_arg')).to.throw('command is not a function');
    });
});
