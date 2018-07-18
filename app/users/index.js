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
                    require('./controllers/user-accounts-controller.html'),
                'controller': 'userAccountsController',
                authenticated: true
              })
              .when('/users', {
                'template':
                    require('./controllers/user-accounts-controller.html'),
                'controller': 'userAccountsController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
