import {Terminal} from 'xterm';
import style from 'xterm/dist/xterm.css';
import * as attach from 'xterm/lib/addons/attach/attach';
import * as fit from 'xterm/lib/addons/fit/fit';
const configJSON = require('../../../config.json');
if (configJSON.keyType == 'VT100+') {
  var vt100PlusKey = require('./vt100plus');
}

const customKeyHandlers = function(ev) {
  if (configJSON.keyType == 'VT100+') {
    return vt100PlusKey.customVT100PlusKey(ev, this);
  }
  return true;
};

function measureChar(term) {
  const span = document.createElement('span');
  let fontFamily = 'courier-new';
  let fontSize = 15;
  let rect;

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

window.angular &&
  (function(angular) {
    'use strict';

    angular.module('app.common.directives').directive('serialConsole', [
      function() {
        return {
          restrict: 'E',
          template: require('./serial-console.html'),
          scope: {path: '=', showTabBtn: '=?'},
          controller: [
            '$scope',
            '$window',
            'dataService',
            function($scope, $window, dataService) {
              $scope.dataService = dataService;

              // See https://github.com/xtermjs/xterm.js/ for available xterm
              // options

              Terminal.applyAddon(attach); // Apply the `attach` addon
              Terminal.applyAddon(fit); // Apply the `fit` addon

              const border = 10;
              const term = new Terminal();
              const terminal = document.getElementById('terminal');
              let customConsole;
              let charSize;
              let termContainer;

              term.open(terminal);
              customConsole = configJSON.customConsoleDisplaySize;

              if (customConsole != null) {
                charSize = measureChar(term);
                termContainer = document.getElementById('term-container');
                if (termContainer != null) {
                  if (customConsole.width) {
                    termContainer.style.width =
                      charSize.width * customConsole.width + border + 'px';
                  }
                  if (customConsole.height) {
                    terminal.style.height =
                      charSize.height * customConsole.height + border + 'px';
                  }
                }
              }
              term.fit();
              if (configJSON.customKeyEnable == true) {
                term.attachCustomKeyEventHandler(customKeyHandlers);
              }
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
                  'websocket closed. code: ' +
                    event.code +
                    ' reason: ' +
                    event.reason
                );
              };
              $scope.openTerminalWindow = function() {
                $window.open(
                  '#/server-control/remote-console-window',
                  'Remote Console Window',
                  'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550'
                );
              };
            },
          ],
        };
      },
    ]);
  })(window.angular);
