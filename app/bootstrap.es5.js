(function() {
  function loadScript(path) {
    return new Promise(function(resolve, reject) {
      var node = document.createElement('script');
      node.onload = resolve;
      node.onerror = reject;
      node.src = path;
      document.head.appendChild(node);
    });
  }

  loadScript('/system.js')
    .then(function() {
      System.import('/init.js');
    });
})();
