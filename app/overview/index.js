/**
 * A module for the overview
 *
 * @module app/overview/index
 * @exports app/overview/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
<<<<<<< HEAD
                .when('/overview/system', {
                    'templateUrl': 'overview/controllers/system-overview-controller.html',
                    'controller': 'systemOverviewController',
                    authenticated: true
                })
                .when('/overview', {
=======
                .when('/overview/bmc-reboot', {
                    'templateUrl': 'overview/controllers/bmc-reboot-controller.html',
                    'controller': 'bmcRebootController',
                    authenticated: true
                })
                .when('/overview/log', {
                    'templateUrl': 'overview/controllers/log-controller.html',
                    'controller': 'logController',
                    authenticated: true
                })
                .when('/overview/power-operations', {
                    'templateUrl': 'overview/controllers/power-operations-controller.html',
                    'controller': 'powerOperationsController',
                    authenticated: true
                })
                .when('/overview/unit-id', {
                    'templateUrl': 'overview/controllers/unit-id-controller.html',
                    'controller': 'unitIdController',
                    authenticated: true
                })
                .when('/overview/system', {
>>>>>>> 4c1a3dd... Major update to code structure
                    'templateUrl': 'overview/controllers/system-overview-controller.html',
                    'controller': 'systemOverviewController',
                    authenticated: true
                });
        }]);

})(window.angular);
