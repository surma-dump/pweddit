describe('Utils', function() {
  beforeEach(function(done) {
    System.import('/modules/Utils.js')
      .then(subject => this.subject = subject)
      .then(_ => done());
  });

  describe('allMatches', function() {
    it('should return all matches of a regexp', function() {
      const r = /a(.)/g;
      const f = this.subject.default.allMatches.bind(r);
      const matches = f('abacada');
      expect(JSON.stringify(matches)).to.equal(JSON.stringify([['ab', 'b'], ['ac', 'c'], ['ad', 'd']]));
    });
  })
});
