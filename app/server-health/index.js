/**
 * A module for the serverHealth
 *
 * @module app/server-health/index
 * @exports app/server-health/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.serverHealth', ['ngRoute', 'app.common.services'])
      // Route configuration
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/server-health/event-log', {
                'template': require('./controllers/log-controller.html'),
                'controller': 'logController',
                authenticated: true
              })
              .when('/server-health/event-log/:type', {
                'template': require('./controllers/log-controller.html'),
                'controller': 'logController',
                authenticated: true
              })
              .when('/server-health/event-log/:type/:id', {
                'template': require('./controllers/log-controller.html'),
                'controller': 'logController',
                authenticated: true
              })
              .when('/server-health/inventory-overview', {
                'template':
                    require('./controllers/inventory-overview-controller.html'),
                'controller': 'inventoryOverviewController',
                authenticated: true
              })
              .when('/server-health/inventory', {
                'template': require('./controllers/inventory-controller.html'),
                'controller': 'inventoryController',
                authenticated: true
              })
              .when('/server-health/sensors-overview', {
                'template':
                    require('./controllers/sensors-overview-controller.html'),
                'controller': 'sensorsOverviewController',
                authenticated: true
              })
              .when('/server-health/sensors/:type', {
                'template': require('./controllers/sensors-controller.html'),
                'controller': 'sensorsController',
                authenticated: true
              })
              .when('/server-health', {
                'template': require('./controllers/log-controller.html'),
                'controller': 'logController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
