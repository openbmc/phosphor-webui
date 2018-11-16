import {Terminal} from 'xterm';
import * as attach from 'xterm/lib/addons/attach/attach';
import * as fit from 'xterm/lib/addons/fit/fit';


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

            Terminal.applyAddon(attach); // Apply the `attach` addon
            Terminal.applyAddon(fit); // Apply the `fit` addon

            const term = new Terminal();
            term.open(document.getElementById('terminal'));
            term.fit();
            const SOL_THEME = {
              background: '#19273c',
              cursor: 'rgba(83, 146, 255, .5)',
              scrollbar: 'rgba(83, 146, 255, .5)',
            };
            term.setOption('theme', SOL_THEME);
            const hostname = dataService.getHost().replace('https://', '');
            const host = 'wss://' + hostname + '/console0';
            const ws = new WebSocket(host);
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
                  'directories=no,' +
                  'titlebar=no,' +
                  'toolbar=no,' +
                  'location=no,' +
                  'status=no,' +
                  'menubar=no,' +
                  'scrollbars=no,' +
                  'resizable=yes,' +
                  'width=600,' +
                  'height=550');
            };
          },
        ],
      };
    },
  ]);
})(window.angular);
