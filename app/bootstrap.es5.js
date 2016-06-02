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
      System.config({
        meta: {
          '*': {
            // Use <script> or importScripts() to load scripts rather than fetch()
            scriptLoad: true
          }
        }
      });

      System.import('/init.js');
    });
})();
