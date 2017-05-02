/**
 * A module for the serverHealth
 *
 * @module app/server-health/index
 * @exports app/server-health/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverHealth', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/server-health/event-log', {
                    'templateUrl': 'server-health/controllers/log-controller.html',
                    'controller': 'logController',
                    authenticated: true
                })
                .when('/server-health/inventory-overview', {
                    'templateUrl': 'server-health/controllers/inventory-overview-controller.html',
                    'controller': 'inventoryOverviewController',
                    authenticated: true
                })
                .when('/server-health/inventory', {
                    'templateUrl': 'server-health/controllers/inventory-controller.html',
                    'controller': 'inventoryController',
                    authenticated: true
                })
                .when('/server-health/sensors-overview', {
                    'templateUrl': 'server-health/controllers/sensors-overview-controller.html',
                    'controller': 'sensorsOverviewController',
                    authenticated: true
                })
                .when('/server-health/sensors/:type', {
                    'templateUrl': 'server-health/controllers/sensors-controller.html',
                    'controller': 'sensorsController',
                    authenticated: true
                })
                .when('/server-health/power-consumption', {
                    'templateUrl': 'server-health/controllers/power-consumption-controller.html',
                    'controller': 'powerConsumptionController',
                    authenticated: true
                })
                .when('/server-health/unit-id', {
                    'templateUrl': 'server-health/controllers/unit-id-controller.html',
                    'controller': 'unitIdController',
                    authenticated: true
                })
                .when('/server-health/diagnostics', {
                    'templateUrl': 'server-health/controllers/diagnostics-controller.html',
                    'controller': 'diagnosticsController',
                    authenticated: true
                })
                .when('/server-health', {
                    'templateUrl': 'server-health/controllers/log-controller.html',
                    'controller': 'logController',
                    authenticated: true
                });
        }]);

})(window.angular);
