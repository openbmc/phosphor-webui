/**
 * A module for the serverControl
 *
 * @module app/server-control/index
 * @exports app/server-control/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module(
          'app.serverControl',
          ['ngRoute', 'app.constants', 'app.common.services'])
      // Route configuration
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/server-control/bmc-reboot', {
                'template': require('./controllers/bmc-reboot-controller.html'),
                'controller': 'bmcRebootController',
                authenticated: true
              })
              .when('/server-control/server-led', {
                'template': require('./controllers/unit-id-controller.html'),
                'controller': 'unitIdController',
                authenticated: true
              })
              .when('/server-control/power-operations', {
                'template':
                    require('./controllers/power-operations-controller.html'),
                'controller': 'powerOperationsController',
                authenticated: true
              })
              .when('/server-control/remote-console', {
                'template':
                    require('./controllers/remote-console-controller.html'),
                'controller': 'remoteConsoleController',
                authenticated: true
              })
              .when('/server-control/remote-console-window', {
                'template': require(
                    './controllers/remote-console-window-controller.html'),
                'controller': 'remoteConsoleWindowController',
                authenticated: true
              })
              .when('/server-control', {
                'template':
                    require('./controllers/power-operations-controller.html'),
                'controller': 'powerOperationsController',
                authenticated: true
              });
        }
      ]);

})(window.angular);
