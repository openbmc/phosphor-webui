import {Terminal} from 'xterm';
import style from 'xterm/dist/xterm.css';
import * as attach from 'xterm/lib/addons/attach/attach';
import * as fit from 'xterm/lib/addons/fit/fit';
var configJSON = require('../../../config.json');
var EscapeSequences = require('xterm/lib/common/data/EscapeSequences');

var customBackspace =
    function(ev, term) {
  if (ev.altKey) {
    return true;
  } else if (!ev.shiftKey) {
    term.handler(EscapeSequences.C0.BS);  // Backspace
  } else {
    term.handler(EscapeSequences.C0.DEL);  // Delete
  }
  return false;
}

var callbackArray = [customBackspace];

function customKeyHandlers(ev) {
  for (var i = 0; i < configJSON.keyNumber; i++) {
    if (ev.keyCode == configJSON.keys[i].keyCode) {
      return callbackArray[configJSON.keys[i].keyHandler](ev, this);
    }
  }
  return true;
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
          '$scope', '$window', 'dataService',
          function($scope, $window, dataService) {
            $scope.dataService = dataService;

            // See https://github.com/xtermjs/xterm.js/ for available xterm
            // options

            Terminal.applyAddon(attach);  // Apply the `attach` addon
            Terminal.applyAddon(fit);     // Apply the `fit` addon

            var term = new Terminal();
            term.open(document.getElementById('terminal'));
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
            var ws = new WebSocket(host);
            term.attach(ws);
            ws.onopen = function() {
              console.log('websocket opened');
            };
            ws.onclose = function(event) {
              console.log(
                  'websocket closed. code: ' + event.code +
                  ' reason: ' + event.reason);
            };
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
