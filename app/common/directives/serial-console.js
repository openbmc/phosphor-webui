import {Terminal} from 'xterm';
import style from 'xterm/dist/xterm.css';
import * as attach from 'xterm/lib/addons/attach/attach';
import * as fit from 'xterm/lib/addons/fit/fit';
var configJSON = require('../../../config.json');

function measureChar(term) {
  var span = document.createElement('span');
  span.textContent = 'W';
  var fontFamily = 'courier-new';
  var fontSize = 15;
  try {
    var fontFamily = term.getOption('fontFamily');
    var fontSize = term.getOption('fontSize');
  } catch (err) {
    console.log('get option failure');
  }
  span.style.fontFamily = fontFamily;
  span.style.fontSize = fontSize + 'px';
  document.body.appendChild(span);
  var rect = span.getBoundingClientRect();
  document.body.removeChild(span);
  return rect;
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

            var border = 10;
            var term = new Terminal();
            var terminal = document.getElementById('terminal');
            term.open(terminal);
            var customConsole = configJSON.customConsoleDisplaySize;
            if (customConsole != null) {
              var charSize = measureChar(term);
              var termContainer = document.getElementById('term-container');
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
