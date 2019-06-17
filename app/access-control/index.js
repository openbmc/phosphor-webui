/**
 * A module for the users
 *
 * @module app/access-control/index
 * @exports app/access-control/index
 */

window.angular && (function(angular) {
  'use strict';

  angular
      .module('app.accessControl', ['ngRoute', 'app.common.services'])
      // Route access-control
      .config([
        '$routeProvider',
        function($routeProvider) {
          $routeProvider
              .when('/access-control/users', {
                'template': require('./controllers/user-controller.html'),
                'controller': 'userController',
                authenticated: true
              })
              .when('/access-control', {
                'template': require('./controllers/user-controller.html'),
                'controller': 'userController',
                authenticated: true
              })
              .when('/access-control/certificate', {
                'template':
                    require('./controllers/certificate-controller.html'),
                'controller': 'certificateController',
                authenticated: true
              })
              .when('/access-control/ldap', {
                'template': require('./controllers/ldap-controller.html'),
                'controller': 'ldapController',
                authenticated: true
              });
        }
      ]);
})(window.angular);
