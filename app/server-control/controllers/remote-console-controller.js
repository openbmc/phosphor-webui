/**
 * Controller for server
 *
 * @module app/serverControl
 * @exports remoteConsoleController
 * @name remoteConsoleController
 * @version 0.1.0
 */

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
                
                //Storage
                hterm.defaultStorage = new lib.Storage.Local();

                var term = new hterm.Terminal("foo");
                term.onTerminalReady = function() {
                    var io = term.io.push();
                    io.onVTKeystroke = function(str) {
                        console.log(str)
                        term.io.print(str);
                    };
                    io.sendString = function(str) {
                        console.log(str)
                    };
                };
                term.decorate(document.querySelector('#terminal'));

                //Set cursor color
                term.prefs_.set('cursor-color', 'rgba(83, 146, 255, .5)');

                //Set background color
                term.prefs_.set('background-color', '#19273c');

                //Print to console window
                term.io.println('OpenBMC ver.00');
                term.io.println('This is not an actual live connection.');
                term.io.print('root@IBM:');
                
                //Allows keyboard input
                term.installKeyboard();
            }
        ]
    );

})(angular);
