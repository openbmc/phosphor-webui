/**
 * A module for the users
 *
 * @module app/users/index
 * @exports app/users/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.users', ['ngRoute', 'app.common.services'])
      // Route configuration
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/users/manage-accounts', {
                'template':
                    require('./controllers/manage-accounts-controller.html'),
                'controller': 'manageAccountsController',
                authenticated: true
              })
              .when('/users/password-change', {
                'template':
                    require('./controllers/password-change-controller.html'),
                'controller': 'passwordChangeController',
                authenticated: true
              })
              .when('/users', {
                'template':
                    require('./controllers/manage-accounts-controller.html'),
                'controller': 'manageAccountsController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
