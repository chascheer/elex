(function(document, $body) {

'use strict';

// parent window

window.addEventListener('message', function(event) {
  var data = event.data;
  var source = event.source;
  if (data && data.sentinel === 'amp' && data.type === 'embed-size' && data.height && source) {
    for (var i = 0, iframes = $body.getElementsByTagName('iframe'); i < iframes.length; ++i) {
      var iframe = iframes[i];
      if (iframe.contentWindow === source) {
        iframe.setAttribute('height', data.height);
      }
    }
  }
}, false); // listener

var ready = function() {
  $body = document.body; // set $body twice for message, load
  for (var i = 0, iframes = $body.getElementsByTagName('iframe'); i < iframes.length; ++i) {
    var iframe = iframes[i];
    if (/media\.(thenewstribune|idahostatesman|theolympian|bellinghamherald|tri\-cityherald)\.com/.test(iframe.src)) {
      iframe.contentWindow.postMessage({
        'sentinel': 'sb',
        'type': 'embed-size-request'
      }, '*');
    }
  }
}; // ready

if (document.readyState === 'complete') {
  return ready();
}

document.addEventListener('DOMContentLoaded', ready);

})(document, document.body);
