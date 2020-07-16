import {Terminal} from 'xterm';
import style from 'xterm/dist/xterm.css';
import * as attach from 'xterm/lib/addons/attach/attach';
import * as fit from 'xterm/lib/addons/fit/fit';
var configJSON = require('../../../config.json');
if (configJSON.keyType == 'VT100+') {
  var vt100PlusKey = require('./vt100plus');
}

var customKeyHandlers = function(ev) {
  if (configJSON.keyType == 'VT100+') {
    return vt100PlusKey.customVT100PlusKey(ev, this);
  }
  return true;
};

function measureChar(term) {
  var span = document.createElement('span');
  var fontFamily = 'courier-new';
  var fontSize = 15;
  var rect;

  span.textContent = 'W';
  try {
    fontFamily = term.getOption('fontFamily');
    fontSize = term.getOption('fontSize');
  } catch (err) {
    console.log('get option failure');
  }
  span.style.fontFamily = fontFamily;
  span.style.fontSize = fontSize + 'px';
  document.body.appendChild(span);
  rect = span.getBoundingClientRect();
  document.body.removeChild(span);
  return rect;
}

// Add a TextEncoder polyfill to handle ie9 properly.  (does anyone still use that anymore?
// Grabbed from
// https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#Polyfill
if (typeof TextEncoder === "undefined") {
    TextEncoder=function TextEncoder(){};
    TextEncoder.prototype.encode = function encode(str) {
        "use strict";
        var Len = str.length, resPos = -1;
        // The Uint8Array's length must be at least 3x the length of the string because an invalid UTF-16
        //  takes up the equivelent space of 3 UTF-8 characters to encode it properly. However, Array's
        //  have an auto expanding length and 1.5x should be just the right balance for most uses.
        var resArr = typeof Uint8Array === "undefined" ? new Array(Len * 1.5) : new Uint8Array(Len * 3);
        for (var point=0, nextcode=0, i = 0; i !== Len; ) {
            point = str.charCodeAt(i), i += 1;
            if (point >= 0xD800 && point <= 0xDBFF) {
                if (i === Len) {
                    resArr[resPos += 1] = 0xef/*0b11101111*/; resArr[resPos += 1] = 0xbf/*0b10111111*/;
                    resArr[resPos += 1] = 0xbd/*0b10111101*/; break;
                }
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                nextcode = str.charCodeAt(i);
                if (nextcode >= 0xDC00 && nextcode <= 0xDFFF) {
                    point = (point - 0xD800) * 0x400 + nextcode - 0xDC00 + 0x10000;
                    i += 1;
                    if (point > 0xffff) {
                        resArr[resPos += 1] = (0x1e/*0b11110*/<<3) | (point>>>18);
                        resArr[resPos += 1] = (0x2/*0b10*/<<6) | ((point>>>12)&0x3f/*0b00111111*/);
                        resArr[resPos += 1] = (0x2/*0b10*/<<6) | ((point>>>6)&0x3f/*0b00111111*/);
                        resArr[resPos += 1] = (0x2/*0b10*/<<6) | (point&0x3f/*0b00111111*/);
                        continue;
                    }
                } else {
                    resArr[resPos += 1] = 0xef/*0b11101111*/; resArr[resPos += 1] = 0xbf/*0b10111111*/;
                    resArr[resPos += 1] = 0xbd/*0b10111101*/; continue;
                }
            }
            if (point <= 0x007f) {
                resArr[resPos += 1] = (0x0/*0b0*/<<7) | point;
            } else if (point <= 0x07ff) {
                resArr[resPos += 1] = (0x6/*0b110*/<<5) | (point>>>6);
                resArr[resPos += 1] = (0x2/*0b10*/<<6)  | (point&0x3f/*0b00111111*/);
            } else {
                resArr[resPos += 1] = (0xe/*0b1110*/<<4) | (point>>>12);
                resArr[resPos += 1] = (0x2/*0b10*/<<6)    | ((point>>>6)&0x3f/*0b00111111*/);
                resArr[resPos += 1] = (0x2/*0b10*/<<6)    | (point&0x3f/*0b00111111*/);
            }
        }
        if (typeof Uint8Array !== "undefined") return resArr.subarray(0, resPos + 1);
        // else // IE 6-9
        resArr.length = resPos + 1; // trim off extra weight
        return resArr;
    };
    TextEncoder.prototype.toString = function(){return "[object TextEncoder]"};
    try { // Object.defineProperty only works on DOM prototypes in IE8
        Object.defineProperty(TextEncoder.prototype,"encoding",{
            get:function(){if(TextEncoder.prototype.isPrototypeOf(this)) return"utf-8";
                           else throw TypeError("Illegal invocation");}
        });
    } catch(e) { /*IE6-8 fallback*/ TextEncoder.prototype.encoding = "utf-8"; }
    if(typeof Symbol!=="undefined")TextEncoder.prototype[Symbol.toStringTag]="TextEncoder";
}

window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('serialConsole', [
    function() {
      return {
        'restrict': 'E',
        'template': require('./serial-console.html'),
        'scope': {'path': '=', 'showTabBtn': '=?'},
        'controller': [
          '$scope', '$cookies', '$window', 'dataService', '$element',
          function($scope, $cookies, $window, dataService, $element) {
            $scope.dataService = dataService;

            // See https://github.com/xtermjs/xterm.js/ for available xterm
            // options

            Terminal.applyAddon(attach);  // Apply the `attach` addon
            Terminal.applyAddon(fit);     // Apply the `fit` addon

            var border = 10;
            var term = new Terminal();
            // Should be a reference to <div id="terminal"></div>
            var terminal = $element[0].firstElementChild.firstElementChild;
            var customConsole;
            var charSize;
            var termContainer;

            term.open(terminal);
            customConsole = configJSON.customConsoleDisplaySize;

            if (customConsole != null) {
              charSize = measureChar(term);
              termContainer = document.getElementById('term-container');
              if (termContainer != null) {
                if (customConsole.width) {
                  termContainer.style.width =
                      (charSize.width * customConsole.width + border) + 'px';
                }
                if (customConsole.height) {
                  terminal.style.height =
                      (charSize.height * customConsole.height + border) + 'px';
                }
              }
            }
            term.fit();
            if (configJSON.customKeyEnable == true) {
              term.attachCustomKeyEventHandler(customKeyHandlers);
            }
            var SOL_THEME = {
              background: '#19273c',
              cursor: 'rgba(83, 146, 255, .5)',
              scrollbar: 'rgba(83, 146, 255, .5)'
            };
            term.setOption('theme', SOL_THEME);
            var hostname = dataService.getHost().replace('https://', '');
            var host = 'wss://' + hostname + '/console0';
            var token = $cookies.get('XSRF-TOKEN');
            try {
              var ws = new WebSocket(host, [token]);
              term.attach(ws);
              ws.onopen = function() {
                console.log('websocket opened');
              };
              ws.onclose = function(event) {
                console.log(
                    'websocket closed. code: ' + event.code +
                    ' reason: ' + event.reason);
              };
            } catch (error) {
              console.log(JSON.stringify(error));
            }
            $scope.openTerminalWindow = function() {
              $window.open(
                  '#/server-control/remote-console-window',
                  'Remote Console Window',
                  'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550');
            };
          }
        ]
      };
    }
  ]);
})(window.angular);
