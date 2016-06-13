describe('Downloader', function() {
  beforeEach(function(done) {
    SystemJS.import('/modules/Downloader.js')
      .then(subject => this.subject = subject)
      .then(_ => done());
  });

  it('should be an object', function() {
    expect(this.subject).to.exist;
  });
});
