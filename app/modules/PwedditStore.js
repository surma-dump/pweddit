import idb from '/idb.js';

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
    this.dbHandle = idb.open('pweddit', 3, upgradeDB => {
      if(!upgradeDB.oldVersion || upgradeDB.oldVersion < 1) {
        upgradeDB.createObjectStore('recents', {keyPath: 'subreddit'});
      }
      if(!upgradeDB.oldVersion || upgradeDB.oldVersion < 2) {
        upgradeDB.createObjectStore('dlqueue');
      }
      if(!upgradeDB.oldVersion || upgradeDB.oldVersion < 3) {
        upgradeDB.deleteObjectStore('dlqueue');
        upgradeDB.createObjectStore('dlqueue', {autoIncrement: true});
      }
    });
  }

  queuePushThread(subreddit, threadid) {
    return this.dbHandle
      .then(db => {
        const tx = db.transaction('dlqueue', 'readwrite');
        tx.objectStore('dlqueue')
          .put({
            type: 'thread',
            subreddit,
            threadid,
            commentLinks: true
          });
        return tx.complete;
      });
  }

  queuePushUrl(url) {
    return this.dbHandle
      .then(db => {
        const tx = db.transaction('dlqueue', 'readwrite');
        tx.objectStore('dlqueue')
          .put({
            type: 'url',
            url
          });
        return tx.complete;
      });
  }


  queuePop() {
    return this.dbHandle
      .then(db => {
        const tx = db.transaction('dlqueue', 'readwrite');
        let val;
        tx.objectStore('dlqueue').iterateCursor(cursor => {
          if(!cursor)
            return;
          val = cursor.value;
          cursor.delete();
        });
        return tx.complete.then(_ => val);
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
  if (typeof self._pwedditStore === 'undefined')
    self._pwedditStore = new PwedditStore();
  return self._pwedditStore;
}
