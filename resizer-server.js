(function(window, document, parent, $docele) {

'use strict';

// iframe / child window

var DEFAULT_TIMER = 4999; // should match IFrameURL -- 999ms ~= 1.0s
var MIN_TIMER = 300; // should match IFrameURL -- 300ms == 0.3s

window.SB = window.SB || {};
var SB = window.SB.v1 = window.SB.v1 || {};

// args

var args = {'timer': null};
var scripts = document.getElementsByTagName('script');
for (var si = 0; si < scripts.length; ++si) {
  var src = scripts[si].src;
  if (!src) {
    continue;
  }

  var m = src.match(/resizer(?:\-\w+)?\.js(?:\?[^#]+)?(#.*)?$/);
  if (!m) {
    continue;
  }

  if (m[1]) {
    for (var hi = 0, hashargs = m[1].substr(1).split(';'); hi < hashargs.length; ++hi) {
      var parts = hashargs[hi].split('=');
      args[parts[0]] = (parts[1] === undefined) ? true : parts[1];
    }
  }

  break;
}

// timer arg
var argstimer = args.timer;
if (argstimer === null) {
  argstimer = false;
} else if (argstimer === true || argstimer === '1') {
  argstimer = DEFAULT_TIMER;
} else {
  argstimer = parseFloat(args.timer);
  if (isNaN(argstimer)) {
    argstimer = DEFAULT_TIMER;
  } else {
    argstimer *= 1000;
    if (argstimer < MIN_TIMER) {
      argstimer = DEFAULT_TIMER;
    }
  }
}

// send height

var timer;
var sendHeight = SB.sendHeight = function() {
  clearTimeout(timer);
  timer = setTimeout(function() {
    var h = $docele.offsetHeight;
    parent.postMessage({
      'sentinel': 'amp',
      'type': 'embed-size',
      'height': (h > 99) ? h : 100
    }, '*');
  }, 99);
}; // sendHeight

// listen for message (embed-size-request)

var lasth = null;
window.addEventListener('message', function(event) {
  var data = event.data;
  if (!data) {
    return;
  }

  var h = $docele.offsetHeight;
  if (h === lasth) {
    return;
  }

  var type = data.type;
  var sentinel = data.sentinel;
  if ((sentinel === 'sb' && type === 'embed-size-request') || (sentinel === 'amp' && type === 'intersection')) {
    lasth = h;
    sendHeight();
  }
}, false); // listener

// ready / doc loaded

var ready = function() {
  $docele = document.documentElement; // set $docele twice for message, load

  window.onclick = sendHeight;
  window.onresize = sendHeight;
  document.body.onresize = sendHeight;

  if (argstimer) { // send height on a timer (only when changed)
    var lasth = null;
    var checkHeight = function() {
      var h = $docele.offsetHeight;
      if (h !== lasth) {
        lasth = h;
        sendHeight();
      }

      setTimeout(checkHeight, argstimer);
    }; // checkHeight

    setTimeout(checkHeight, argstimer);
  } else { // send initial height only
    setTimeout(sendHeight, DEFAULT_TIMER);
  }

  parent.postMessage({
    'sentinel': 'amp',
    'type': 'send-intersections'
  }, '*');
}; // ready

// init

if (document.readyState === 'complete') {
  return ready();
}

document.addEventListener('DOMContentLoaded', ready);

})(window, document, window.parent, document.documentElement);
