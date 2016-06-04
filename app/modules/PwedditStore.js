import '/idb.js';

class PwedditStore {
  constructor() {
    this._createDB();
  }

  getRecentSubreddits() {
    return this.dbHandle
      .then(db =>
        db.transaction('recents', 'readonly')
          .objectStore('recents')
          .getAll()
      )
      .then(allRecents =>
          allRecents
            .sort((a, b) => a.count - b.count)
            .reverse()
            .slice(0, 30)
      );
  }

  incrementSubredditCounter(subredditName) {
    return this.dbHandle
      .then(db =>
        db.transaction('recents', 'readonly')
          .objectStore('recents')
          .get(subredditName)
          .then(subreddit => {
            if(!subreddit) {
              return {db, subreddit: {subreddit: subredditName, count: 0}};
            }
            return {db, subreddit};
          })
      )
      .then(({db, subreddit}) => {
        subreddit.count++;
        const writeTx = db.transaction('recents', 'readwrite');
        writeTx.objectStore('recents')
          .put(subreddit);
        return writeTx.complete;
      });
  }

  removeFromRecents(subredditName) {
    return this.dbHandle
      .then(db => {
        const tx = db.transaction('recents', 'readwrite');
        tx.objectStore('recents')
          .delete(subredditName);
        return tx.complete;
      });
  }

  _createDB() {
    this.dbHandle = idb.open('pweddit', 1, upgradeDB => {
      const recents = upgradeDB.createObjectStore('recents', {keyPath: 'subreddit'});
    });
  }

  wipe() {
    return this.dbHandle
      .then(db => db.close())
      .then(_ => {
        idb.delete('pweddit');
        this._createDB();
      });
  }
}

export default function () {
  if (typeof window._pwedditStore === 'undefined')
    window._pwedditStore = new PwedditStore();
  return window._pwedditStore;
}
