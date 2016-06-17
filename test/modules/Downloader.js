describe('Downloader', function() {
  const mockThread = {
    post: {
      url: 'http://example.com',
      selftext_html: '&lt;a href="http://link1a.com"&gt; asdfdsaf &lt;a href="http://link1b.com"&gt;'
    },
    comments: [
      {
        body_html: '&lt;a href="http://link2.com"&gt;',
        replies: {
          data: {
            children: [
              {
                body_html: '&lt;a href="http://link3.com"&gt;'
              }
            ]
          }
        }
      },
      {
        body_html: '&lt;a href="http://link4.com"&gt;'
      }
    ]
  }

  it('should be able to extract links from posts', function() {
    expect(this.subject._linksFromString(mockThread.post.selftext_html)).to.deep.equal(['http://link1a.com', 'http://link1b.com']);
  })

  it('should handle posts with no links', function() {
    expect(this.subject._linksFromString('there is no link in here')).to.deep.equal([]);
  })

  it('should be able to recursively extract links from comments', function() {
    const links = mockThread.comments.reduce((prev, cur) => [...prev, ...this.subject._linksFromComment(cur)], [])
    expect(links).to.deep.equal(['http://link2.com', 'http://link3.com', 'http://link4.com']);
  })

  it('should process all threads in queue', function(done) {
    this.PwedditStore.queuePushThread('subreddit', 'threadid')
      .then(_ => this.PwedditStore.queueLength())
      .then(queueLength => {
        expect(queueLength).to.equal(1);
        return this.subject.downloadAll()
      })
      .then(_ => this.PwedditStore.queueLength())
      .then(queueLength => {
        expect(queueLength).to.equal(0);
        return this.PwedditStore.queuePushThread('subreddit', 'threadid1');
      })
      .then(_ => this.PwedditStore.queuePushThread('subreddit', 'threadid2'))
      .then(_ => this.PwedditStore.queueLength())
      .then(queueLength => {
        expect(queueLength).to.equal(2);
        return this.subject.downloadAll()
      })
      .then(_ => this.PwedditStore.queueLength())
      .then(queueLength => {
        expect(queueLength).to.equal(0);
      })
      .then(...TestUtils.mochaPromise(done));
  });

  it('process all links in queue', function(done) {
    const originalDownloadUrl = this.subject._downloadUrl;
    let callCount = 0;
    this.subject._downloadUrl = function(i) {callCount++};

    this.PwedditStore.queuePushThread('subreddit', 'threadid')
      .then(_ => {
        return this.subject.downloadAll();
      })
      .then(_ => this.PwedditStore.queueLength())
      .then(queueLength => {
        expect(queueLength).to.equal(0);
        expect(callCount).to.equal(6);
        this.subject._downloadUrl = originalDownloadUrl;
      })
      .then(...TestUtils.mochaPromise(done));
  });

  TestUtils.MockModule('/modules/Reddit.js', {
    default: class Reddit {
      static thread(subreddit, id, sorting = 'top', opts = {}) {
        return Promise.resolve(mockThread);
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
        this.subject = Downloader.default;
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

});
