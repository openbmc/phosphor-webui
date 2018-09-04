import {hterm, lib} from 'hterm-umdjs';

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

            // See https://github.com/macton/hterm for available hterm options

            hterm.defaultStorage = new lib.Storage.Local();
            var term = new hterm.Terminal('host-console');
            term.decorate(document.querySelector('#terminal'));
            // Set cursor color
            term.prefs_.set('cursor-color', 'rgba(83, 146, 255, .5)');
            // Set background color
            term.prefs_.set('background-color', '#19273c');
            // Allows keyboard input
            term.installKeyboard();

            // The BMC exposes a websocket at /console0. This can be read
            // or written to access the host serial console.
            var hostname = dataService.getHost().replace('https://', '');
            var host = 'wss://' + hostname + '/console0';
            var ws = new WebSocket(host);
            ws.onmessage = function(evt) {
              // websocket -> terminal
              term.io.print(evt.data);
            };

            // terminal -> websocket
            term.onTerminalReady = function() {
              var io = term.io.push();
              io.onVTKeystroke = function(str) {
                ws.send(str);
              };
              io.sendString = function(str) {
                ws.send(str);
              };
            };

            ws.onopen = function() {
              console.log('websocket opened');
            };
            ws.onclose = function() {
              console.log('websocket closed');
            };
            $scope.openTerminalWindow = function() {
              dataService.setRemoteWindowActive();
              $window.open(
                  '#/server-control/remote-console-window',
                  'Remote Console Window',
                  'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550');
            };
            $scope.$on('$destroy', function() {
              if (ws) {
                ws.close();
              }
            });
          }
        ]
      };
    }
  ]);
})(window.angular);
