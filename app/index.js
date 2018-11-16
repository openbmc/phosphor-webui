/**
 * A module which contains the definition of the application and the base of
 * configuration
 *
 * @module app/index/services/index
 * @exports app/index
 *
 */

import 'bootstrap/dist/css/bootstrap.css';

import 'angular';
import 'angular-animate';
import 'angular-clipboard';
import 'angular-cookies';
import 'angular-route';
import 'angular-sanitize';
import 'angular-ui-bootstrap';
import 'angular-ui-router';
import 'angularUtils/src/angularUtils.js';
import 'angularUtils/src/directives/pagination/dirPagination.js';

require('./styles/index.scss');
// const config = require('../config.json');

import './common/services/index.js';
import './common/services/constants.js';
import './common/services/dataService.js';
import './common/services/api-utils.js';
import './common/services/userModel.js';
import './common/services/apiInterceptor.js';

import './common/filters/index.js';

import './common/directives/index.js';
import './common/directives/errors.js';
import './common/directives/app-header.js';
import './common/directives/app-navigation.js';
import './common/directives/confirm.js';
import './common/directives/log-event.js';
import './common/directives/log-filter.js';
import './common/directives/log-search-control.js';
import './common/directives/toggle-flag.js';
import './common/directives/firmware-list.js';
import './common/directives/file.js';
import './common/directives/input.js';
import './common/directives/loader.js';
import './common/directives/paginate.js';
import './common/directives/serial-console.js';

import './login/index.js';
import './login/controllers/login-controller.js';

import './overview/index.js';
import './overview/controllers/system-overview-controller.js';

import './server-control/index.js';
import './server-control/controllers/bmc-reboot-controller.js';
import './server-control/controllers/power-operations-controller.js';
import './server-control/controllers/power-usage-controller.js';
import './server-control/controllers/remote-console-window-controller.js';
import './server-control/controllers/server-led-controller.js';

import './server-health/index.js';
import './server-health/controllers/inventory-overview-controller.js';
import './server-health/controllers/log-controller.js';
import './server-health/controllers/sensors-overview-controller.js';

import './redfish/index.js';
import './redfish/controllers/redfish-controller.js';
import './configuration/index.js';
import './configuration/controllers/date-time-controller.js';
import './configuration/controllers/network-controller.js';
import './configuration/controllers/snmp-controller.js';
import './configuration/controllers/firmware-controller.js';

import './users/index.js';
import './users/controllers/user-accounts-controller.js';

window.angular && (function(angular) {
  'use strict';

  angular
      .module(
          'app',
          [
            // Dependencies
            'ngRoute', 'angular-clipboard',
            'angularUtils.directives.dirPagination',
            // Basic resources
            'app.common.services', 'app.common.directives',
            'app.common.filters',
            // Model resources
            'app.login', 'app.overview', 'app.serverControl',
            'app.serverHealth', 'app.configuration', 'app.users', 'app.redfish',
          ])
      // Route configuration
      .config([
        '$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
          $locationProvider.hashPrefix('');
          // $locationProvider.html5Mode(true);
          $routeProvider.otherwise({'redirectTo': '/login'});
        },
      ])
      .config([
        '$compileProvider',
        function($compileProvider) {
          $compileProvider.aHrefSanitizationWhitelist(
              /^\s*(https?|ftp|mailto|tel|file|data|blob):/);
        },
      ])
      .config([
        '$httpProvider',
        function($httpProvider) {
          $httpProvider.interceptors.push('apiInterceptor');
          $httpProvider.defaults.headers.common = {
            'Accept': 'application/json',
          };
          $httpProvider.defaults.headers.post = {
            'Content-Type': 'application/json',
          };
          $httpProvider.defaults.headers.put = {
            'Content-Type': 'application/json',
          };
          $httpProvider.defaults.headers.patch = {
            'Content-Type': 'application/json',
          };
        },
      ])
      .run([
        '$rootScope', '$location', 'dataService', 'userModel',
        function($rootScope, $location, dataService, userModel) {
          $rootScope.dataService = dataService;
          dataService.path = $location.path();
          $rootScope.$on('$routeChangeStart', function(event, next, current) {
            if (next.$$route == null || next.$$route == undefined) return;
            if (next.$$route.authenticated) {
              if (!userModel.isLoggedIn()) {
                if (next.$$route.originalPath !== null) {
                  $location.path('/login?next=' + next.$$route.originalPath);
                } else {
                  $location.path('/login');
                }
              }
            }

            if (next.$$route.originalPath == '/' ||
                next.$$route.originalPath == '/login') {
              if (userModel.isLoggedIn()) {
                if (current && current.$$route) {
                  $location.path(current.$$route.originalPath);
                } else {
                  $location.path('/overview/server');
                }
              }
            }
          });
          $rootScope.$on('$locationChangeSuccess', function(event) {
            const path = $location.path();
            dataService.path = path;
            if (['/', '/login', '/logout'].indexOf(path) == -1 &&
                path.indexOf('/login') == -1) {
              dataService.showNavigation = true;
            } else {
              dataService.showNavigation = false;
            }
          });

          $rootScope.$on('timedout-user', function() {
            sessionStorage.removeItem('LOGIN_ID');
            if (next.$$route.originalPath !== null) {
              $location.path('/login?next=' + next.$$route.originalPath);
            } else {
              $location.path('/login');
            }
          });
        },
      ]);
})(window.angular);
