import '/idb.js';

class PwedditStore {
  constructor() {
    this.dbHandle = idb.open('pweddit', 1, upgradeDB => {
      const recents = upgradeDB.createObjectStore('recents', {keyPath: 'subreddit'});
    });
  }

  getRecentSubreddits() {
    return this.dbHandle
      .then(db =>
        db.transaction('recents')
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
}

export default function () {
  if (typeof window._pwedditStore === 'undefined')
    window._pwedditStore = new PwedditStore();
  return window._pwedditStore;
}
