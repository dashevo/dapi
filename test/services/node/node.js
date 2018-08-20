const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
var Node = require('../../../lib/services/node/node');

const {expect} = chai;

describe('services/node/node', () => {
    describe('#factory', () => {
        it('should create Node instance', () => {
            const res = new Node();
            expect(res).to.be.instanceof(Node);
        });
        it('should be start function', () => {
            const node = new Node();
            const res = node.start;
            expect(res).to.be.a("function");
        });
        it('should be to call start function without errors', () => {
            const node = new Node();
            const res = node.start();
            expect(res).to.be.a("undefined");
        });
        it('should be announceNewPeer function', () => {
            const node = new Node();
            const res = node.announceNewPeer;
            expect(res).to.be.a("function");
        });
        it('should be to call announceNewPeer function without errors', () => {
            const node = new Node();
            const res = node.announceNewPeer();
            expect(res).to.be.a("undefined");
        });
        it('should be addMemPoolData function', () => {
            const node = new Node();
            const res = node.addMemPoolData;
            expect(res).to.be.a("function");
        });
        it('should addMemPoolData without params and not initialized throw error', () => {
            const node = new Node();
            expect(() => node.addMemPoolData()).to.throw('KeyValueStore hasn\'t been initialized. Run the init() method first.');
        });
        it('should be getMemPoolData function', () => {
            const node = new Node();
            const res = node.getMemPoolData;
            expect(res).to.be.a("function");
        });
        it('should getMemPoolData without params and not initialized throw error', () => {
            const node = new Node();
            expect(() => node.getMemPoolData()).to.throw('KeyValueStore hasn\'t been initialized. Run the init() method first.');
        });
    });
});