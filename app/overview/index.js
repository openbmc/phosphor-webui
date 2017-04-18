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
                .when('/overview/inventory-overview', {
                    'templateUrl': 'overview/controllers/inventory-overview-controller.html',
                    'controller': 'inventoryOverviewController',
                    authenticated: true
                })
                .when('/overview/inventory', {
                    'templateUrl': 'overview/controllers/inventory-controller.html',
                    'controller': 'inventoryController',
                    authenticated: true
                })
                .when('/overview/sensors-overview', {
                    'templateUrl': 'overview/controllers/sensors-overview-controller.html',
                    'controller': 'sensorsOverviewController',
                    authenticated: true
                })
                .when('/overview/sensors', {
                    'templateUrl': 'overview/controllers/sensors-controller.html',
                    'controller': 'sensorsController',
                    authenticated: true
                })
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
                    'templateUrl': 'overview/controllers/system-overview-controller.html',
                    'controller': 'systemOverviewController',
                    authenticated: true
                });
        }]);

})(window.angular);
