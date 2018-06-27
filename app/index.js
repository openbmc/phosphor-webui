/**
 * A module which contains the definition of the application and the base of
 * configuration
 *
 * @module app/index/services/index
 * @exports app/index
 *
 * @author Developer Developer
 */

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'font-awesome/css/font-awesome.css';

import angular from 'angular';
import angular_animate from 'angular-animate';
import angular_clipboard from 'angular-clipboard';
import angular_cookies from 'angular-cookies';
import angular_route from 'angular-route';
import angular_sanitize from 'angular-sanitize';
import angular_ui_bootstrap from 'angular-ui-bootstrap';
import angular_ui_router from 'angular-ui-router';
import angular_utils from 'angularUtils/src/angularUtils.js';
import angular_utils_pagination from 'angularUtils/src/directives/pagination/dirPagination.js';

require('./styles/index.scss');
var config = require('../config.json');

// TODO(Ed)  clean this up, add the appropriate imports to phosphor-webui

import services_index from './common/services/index.js';
import constants from './common/services/constants.js';
import dataService from './common/services/dataService.js';
import api_utils from './common/services/api-utils.js';
import userModel from './common/services/userModel.js';
import apiInterceptor from './common/services/apiInterceptor.js';

import filters_index from './common/filters/index.js';

import directives_index from './common/directives/index.js';
import errors from './common/directives/errors.js';
import app_header from './common/directives/app-header.js';
import app_navigation from './common/directives/app-navigation.js';
import confirm from './common/directives/confirm.js';
import log_event from './common/directives/log-event.js';
import log_filter from './common/directives/log-filter.js';
import log_search_control from './common/directives/log-search-control.js';
import toggle_flag from './common/directives/toggle-flag.js';
import firmware_list from './common/directives/firmware-list.js';
import file from './common/directives/file.js';
import loader from './common/directives/loader.js';
import paginate from './common/directives/paginate.js';

import login_index from './login/index.js';
import login_controller from './login/controllers/login-controller.js';

import overview_index from './overview/index.js';
import system_overview_controller from './overview/controllers/system-overview-controller.js';

import server_control_index from './server-control/index.js';
import bmc_reboot_controller from './server-control/controllers/bmc-reboot-controller.js';
import power_operations_controller from './server-control/controllers/power-operations-controller.js';
import power_usage_controller from './server-control/controllers/power-usage-controller.js';
import remote_console_controller from './server-control/controllers/remote-console-controller.js';
import remote_console_window_controller from './server-control/controllers/remote-console-window-controller.js';
import server_led_controller from './server-control/controllers/server-led-controller.js';

import server_health_index from './server-health/index.js';
import diagnostics_controller from './server-health/controllers/diagnostics-controller.js';
import inventory_controller from './server-health/controllers/inventory-controller.js';
import inventory_overview_controller from './server-health/controllers/inventory-overview-controller.js';
import log_controller from './server-health/controllers/log-controller.js';
import sensors_controller from './server-health/controllers/sensors-controller.js';
import sensors_overview_controller from './server-health/controllers/sensors-overview-controller.js';

import configuration_index from './configuration/index.js';
import date_time_controller from './configuration/controllers/date-time-controller.js';
import file_controller from './configuration/controllers/file-controller.js';
import network_controller from './configuration/controllers/network-controller.js';
import security_controller from './configuration/controllers/security-controller.js';
import firmware_controller from './configuration/controllers/firmware-controller.js';

import multi_server_index from './multi-server/index.js';
import multi_server_controller from './multi-server/controllers/multi-server-controller.js';

import users_index from './users/index.js';
import user_accounts_controller from './users/controllers/user-accounts-controller.js';

import phosphor_templates from './templates.js';
import phosphor_vendors from './vendors.js';

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
            'app.templates', 'app.vendors', 'app.common.services',
            'app.common.directives', 'app.common.filters',
            // Model resources
            'app.login', 'app.overview', 'app.serverControl',
            'app.serverHealth', 'app.configuration', 'app.users',
            'app.multiServer'
          ])
      // Route configuration
      .config([
        '$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
          $locationProvider.hashPrefix('');
          $routeProvider.otherwise({'redirectTo': '/login'});
        }
      ])
      .config([
        '$compileProvider',
        function($compileProvider) {
          $compileProvider.aHrefSanitizationWhitelist(
              /^\s*(https?|ftp|mailto|tel|file|data|blob):/);
        }
      ])
      .config([
        '$httpProvider',
        function($httpProvider) {
          $httpProvider.interceptors.push('apiInterceptor');
        }
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
                $location.path('/login');
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
            var path = $location.path();
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
            $location.path('/login');
          });
        }
      ]);

})(window.angular);
