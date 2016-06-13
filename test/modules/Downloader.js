describe('Downloader', function() {
  TestUtils.MockModule('/modules/Reddit.js', {
    default: class Reddit {
      static thread(subreddit, id, sorting = 'top', opts = {}) {
        return Promise.resolve({
          comments: []
        });
      }
    }
  });

  before(function(done) {
    Promise.all([
      System.import('/modules/Downloader.js'),
      System.import('/modules/PwedditStore.js'),
      System.import('/idb.js')
    ])
      .then(([Downloader, PwedditStore, idb]) => {
        this.PwedditStore = self._pwedditStore = new PwedditStore.PwedditStore('pweddit-test');
        this.subject = Downloader;
      })
      .then(_ => done());
  });

  after(function(done) {
    System.import('/idb.js')
      .then(idb => {
        this.PwedditStore.close();
        return idb.delete('pweddit-test');
      })
      .then(_ => done());
  });

  it('process all links in queue', function(done) {
    this.PwedditStore.queuePushThread('subreddit', 'threadid')
      .then(_ => this.PwedditStore.queueLength())
      .then(queueLength => {
        expect(queueLength).to.equal(1);
        return this.subject.default.downloadAll()
      })
      .then(_ => this.PwedditStore.queueLength())
      .then(queueLength => {
        expect(queueLength).to.equal(0);
        done();
      });
  });
});
