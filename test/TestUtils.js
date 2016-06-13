self.TestUtils = {
  _originals: {},
  MockModule: function(name, mock) {
    before(function(done){
      System.import(name)
        .then(module => {
          self.TestUtils._originals[name] = module;
          System.delete(System.normalizeSync(name));
          System.set(System.normalizeSync(name), System.newModule(mock));
          done();
        });
    });

    after(function(done) {
      System.delete(System.normalizeSync(name));
      System.set(System.normalizeSync(name), self.TestUtils._originals[name]);
      done();
    });
  },

  mochaPromise: function(done) {
    return [
      _ => done(),
      err => done(err)
    ];
  }
}
