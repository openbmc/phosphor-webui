/**
 * A module for the multi-server
 *
 * @module app/multi-server
 * @exports app/multi-server
 */

window.angular && (function(angular) {
  'use strict';

  angular
    .module('app.multiServer', [
      'ngRoute',
      'app.constants',
      'app.common.services'
    ])
    // Route configuration
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/multi-server/overview', {
          'template': require('./controllers/multi-server-controller.html'),
          'controller': 'multiServerController',
          authenticated: true
        });
    }]);

})(window.angular);
