const chai = require('chai');
var Net = require('../../../lib/services/net/net');

const {expect} = chai;

describe('services/net/net', () => {
    describe('#factory', () => {
        it('should create Net instanse', () => {
            const res = new Net();
            expect(res).to.be.instanceof(Net);
        });
        // it('should be updateUsernameIndex function', () => {
        //     const res = userIndex.updateUsernameIndex;
        //     expect(res).to.be.a("function");
        // });
        //
        // it('should be searchUsernames function', () => {
        //     const res = userIndex.searchUsernames;
        //     expect(res).to.be.a("function");
        // });
        //
        // it('should be getUserById function', () => {
        //     const res = userIndex.getUserById;
        //     expect(res).to.be.a("function");
        // });
        //
        // it('should be subscribeToZmq function', () => {
        //     const res = userIndex.subscribeToZmq;
        //     expect(res).to.be.a("function");
        // });
        // it('should updateUsernameIndex return promise', () => {
        //     const res = userIndex.updateUsernameIndex();
        //     expect(res).to.be.a('promise');
        // });
        // it('should searchUsernames return promise', () => {
        //     const res = userIndex.searchUsernames("fake");
        //     expect(res).to.be.a('promise');
        // });
        // it('should subscribeToZmq return error when zmqClient invalid', async () => {
        //     expect(() => userIndex.subscribeToZmq("fake")).to.throw('Cannot read property \'hashblock\' of undefined');
        // });
        // it('should getUserById return undefined with non-existing user', async () => {
        //     const res = userIndex.getUserById("fake");
        //     expect(res).to.be.a('undefined');
        // });

    });
});
