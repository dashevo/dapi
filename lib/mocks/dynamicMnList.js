const cache = require('../services/caching/cachecontroller');
const listUtils = require('../utils/listUtils');
const qDash = require('quorums-dash');

class DynamicMnList {
  constructor() {
    this.cache = new cache();
    this.lastHrMinCached = 0;
  }

  cacheNewMnList() {
    const self = this;
    return new Promise(((resolve, reject) => {
      const list = require('quorums-dash').getMockMnList();
      self.lastHrMinCached = `${new Date().getHours()} ${new Date().getMinutes()}`;

      const cachableList = listUtils.getCacheableList(list);
      self.cache.setMnList(qDash.getHash(cachableList), cachableList);
      resolve(true);
    }));
  }

  getMockMnList() {
    const self = this;
    return new Promise(((resolve, reject) => {
      if (self.lastHrMinCached != `${new Date().getHours()} ${new Date().getMinutes()}`) {
        self.cacheNewMnList()
          .then((success) => {
            if (success) {
              resolve(self.cache.getLastMnList());
            }
          });
      } else {
        self.cache.getLastMnList()
          .then((l) => {
            resolve(l);
          });
      }
    }));
  }

  getMockMnUpdateList(hash) {
    const self = this;
    return new Promise(((resolve, reject) => {
      self.getMockMnList()
        .then((list) => {
          if (self.cache.getLastMnListKey() == hash) {
            resolve({ type: 'none' });
          } else if (self.cache.isDiffCached(hash)) {
            resolve({
              type: 'update',
              list: self.cache.getDiffCache(hash),
            });
          } else {
            resolve({
              type: 'full',
              list,
            });
          }
        });
    }));
  }
}

module.exports = DynamicMnList;
