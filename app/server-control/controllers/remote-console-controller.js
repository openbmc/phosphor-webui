/**
 * Controller for server
 *
 * @module app/serverControl
 * @exports remoteConsoleController
 * @name remoteConsoleController
 * @version 0.1.0
 */

import {hterm, lib} from 'hterm-umdjs';

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverControl')
        .controller('remoteConsoleController', [
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;

                // See https://github.com/macton/hterm for available hterm options

                hterm.defaultStorage = new lib.Storage.Local();
                var term = new hterm.Terminal("host-console");
                term.decorate(document.querySelector('#terminal'));
                //Set cursor color
                term.prefs_.set('cursor-color', 'rgba(83, 146, 255, .5)');
                //Set background color
                term.prefs_.set('background-color', '#19273c');
                //Allows keyboard input
                term.installKeyboard();

                //The BMC exposes a websocket at /console0. This can be read
                //or written to access the host serial console.
                var hostname = dataService.getHost().replace("https://", '');
                var host = "wss://" + hostname + "/console0";
                var ws = new WebSocket(host);
                ws.onmessage = function (evt) {
                    //websocket -> terminal
                    term.io.print(evt.data);
                };

                //terminal -> websocket
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
                    console.log("websocket opened");
                };
                ws.onclose = function() {
                    console.log("websocket closed");
                };
                $scope.$on("$destroy", function() {
                    if(ws) {
                        ws.close();
                    }
                });

                $scope.openTerminalWindow = function(){
                    dataService.setRemoteWindowActive();
                    $window.open('#/server-control/remote-console-window','Remote Console Window','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=400');
                }
            }
        ]
    );

})(angular);
