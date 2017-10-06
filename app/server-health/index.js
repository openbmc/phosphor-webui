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
                    'template': require('./controllers/log-controller.html'),
                    'controller': 'logController',
                    authenticated: true
                })
                .when('/server-health/inventory-overview', {
                    'template': require('./controllers/inventory-overview-controller.html'),
                    'controller': 'inventoryOverviewController',
                    authenticated: true
                })
                .when('/server-health/inventory', {
                    'template': require('./controllers/inventory-controller.html'),
                    'controller': 'inventoryController',
                    authenticated: true
                })
                .when('/server-health/sensors-overview', {
                    'template': require('./controllers/sensors-overview-controller.html'),
                    'controller': 'sensorsOverviewController',
                    authenticated: true
                })
                .when('/server-health/sensors/:type', {
                    'template': require('./controllers/sensors-controller.html'),
                    'controller': 'sensorsController',
                    authenticated: true
                })
                .when('/server-health/power-consumption', {
                    'template': require('./controllers/power-consumption-controller.html'),
                    'controller': 'powerConsumptionController',
                    authenticated: true
                })
                .when('/server-health/unit-id', {
                    'template': require('./controllers/unit-id-controller.html'),
                    'controller': 'unitIdController',
                    authenticated: true
                })
                .when('/server-health/diagnostics', {
                    'template': require('./controllers/diagnostics-controller.html'),
                    'controller': 'diagnosticsController',
                    authenticated: true
                })
                .when('/server-health', {
                    'template': require('./controllers/log-controller.html'),
                    'controller': 'logController',
                    authenticated: true
                });
        }]);

})(window.angular);
