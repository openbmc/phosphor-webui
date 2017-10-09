/**
 * A module for the serverControl
 *
 * @module app/server-control/index
 * @exports app/server-control/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverControl', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/server-control/bmc-reboot', {
                    'templateUrl': 'server-control/controllers/bmc-reboot-controller.html',
                    'controller': 'bmcRebootController',
                    authenticated: true
                })
                .when('/server-control/server-led', {
                    'templateUrl': 'server-health/controllers/unit-id-controller.html',
                    'controller': 'unitIdController',
                    authenticated: true
                })
                .when('/server-control/power-operations', {
                    'templateUrl': 'server-control/controllers/power-operations-controller.html',
                    'controller': 'powerOperationsController',
                    authenticated: true
                })
                .when('/server-control/remote-console', {
                    'templateUrl': 'server-control/controllers/remote-console-controller.html',
                    'controller': 'remoteConsoleController',
                    authenticated: true
                })
                .when('/server-control/remote-console-window', {
                    'templateUrl': 'server-control/controllers/remote-console-window-controller.html',
                    'controller': 'remoteConsoleWindowController',
                    authenticated: true
                })
                .when('/server-control', {
                    'templateUrl': 'server-control/controllers/power-operations-controller.html',
                    'controller': 'powerOperationsController',
                    authenticated: true
                });
        }]);

})(window.angular);
