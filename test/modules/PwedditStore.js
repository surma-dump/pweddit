describe('PwedditStore', function() {
  before(function(done) {
    System.import('/modules/PwedditStore.js')
      .then(subject => this.subject = subject)
      .then(_ => {
        this.subject = new this.subject.PwedditStore('pweddit-test');
        self._pwedditStore = this.subject;
      })
      .then(_ => done());
  });

  after(function(done) {
    this.subject.close()
      .then(_ => System.import('/idb.js'))
      .then(idb => idb.delete('pweddit-test'))
      .then(_ => done());
  });

  it('should return the correct queue length', function(done) {
    this.subject.queueLength()
      .then(length => {
        expect(length).to.equal(0);
        return this.subject.queuePushThread('subreddit', 'id1')
          .then(_ => this.subject.queueLength());
      })
      .then(length => {
        expect(length).to.equal(1);
        return this.subject.queuePushThread('subreddit', 'id2')
          .then(_ => this.subject.queueLength());
      })
      .then(length => {
        expect(length).to.equal(2);
        return this.subject.queuePop()
          .then(_ => this.subject.queuePop())
          .then(_ => this.subject.queueLength());
      })
      .then(length => {
        expect(length).to.equal(0);
      })
      .then(_ => done());
  });
});
