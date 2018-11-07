/**
 * A module which contains the definition of the application and the base of
 * configuration
 *
 * @module app/index/services/index
 * @exports app/index
 *
 */
import 'angular/angular-csp.css';
import 'bootstrap/dist/css/bootstrap.css';

import angular from 'angular';
import angular_animate from 'angular-animate';
import angular_clipboard from 'angular-clipboard';
import angular_cookies from 'angular-cookies';
import angular_messages from 'angular-messages';
import angular_route from 'angular-route';
import angular_sanitize from 'angular-sanitize';
import angular_ui_bootstrap from 'angular-ui-bootstrap';
import angular_ui_router from 'angular-ui-router';
import ngToast from 'ng-toast';
import ngToast_animate from 'ng-toast/dist/ngToast-animations.css';
import ngToast_style from 'ng-toast/dist/ngToast.css';


require('./styles/index.scss');
var config = require('../config.json');

// TODO(Ed)  clean this up, add the appropriate imports to phosphor-webui

import services_index from './common/services/index.js';
import constants from './common/services/constants.js';
import dataService from './common/services/dataService.js';
import toastService from './common/services/toastService.js';
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
import certificate from './common/directives/certificate.js';
import log_filter from './common/directives/log-filter.js';
import log_search_control from './common/directives/log-search-control.js';
import toggle_flag from './common/directives/toggle-flag.js';
import firmware_list from './common/directives/firmware-list.js';
import file from './common/directives/file.js';
import input from './common/directives/input.js';
import click_outside from './common/directives/click-outside.js';
import loader from './common/directives/loader.js';
import paginate from './common/directives/paginate.js';
import serial_console from './common/directives/serial-console.js';
import dir_paginate from './common/directives/dirPagination.js';
import form_input_error from './common/directives/form-input-error.js';

import login_index from './login/index.js';
import login_controller from './login/controllers/login-controller.js';

import overview_index from './overview/index.js';
import system_overview_controller from './overview/controllers/system-overview-controller.js';

import server_control_index from './server-control/index.js';
import bmc_reboot_controller from './server-control/controllers/bmc-reboot-controller.js';
import power_operations_controller from './server-control/controllers/power-operations-controller.js';
import power_usage_controller from './server-control/controllers/power-usage-controller.js';
import remote_console_window_controller from './server-control/controllers/remote-console-window-controller.js';
import server_led_controller from './server-control/controllers/server-led-controller.js';

import server_health_index from './server-health/index.js';
import inventory_overview_controller from './server-health/controllers/inventory-overview-controller.js';
import log_controller from './server-health/controllers/log-controller.js';
import sensors_overview_controller from './server-health/controllers/sensors-overview-controller.js';
import syslog_controller from './server-health/controllers/syslog-controller.js';
import syslog_filter from './common/directives/syslog-filter.js';

import redfish_index from './redfish/index.js';
import redfish_controller from './redfish/controllers/redfish-controller.js';
import configuration_index from './configuration/index.js';
import date_time_controller from './configuration/controllers/date-time-controller.js';
import certificate_controller from './configuration/controllers/certificate-controller.js';
import network_controller from './configuration/controllers/network-controller.js';
import snmp_controller from './configuration/controllers/snmp-controller.js';
import firmware_controller from './configuration/controllers/firmware-controller.js';

import users_index from './users/index.js';
import user_accounts_controller from './users/controllers/user-accounts-controller.js';

window.angular && (function(angular) {
  'use strict';

  angular
      .module(
          'app',
          [
            // Dependencies
            'ngRoute', 'angular-clipboard', 'ngToast', 'ngAnimate',
            'ngMessages', 'app.common.directives.dirPagination', 'ngSanitize',
            // Basic resources
            'app.common.services', 'app.common.directives',
            'app.common.filters',
            // Model resources
            'app.login', 'app.overview', 'app.serverControl',
            'app.serverHealth', 'app.configuration', 'app.users', 'app.redfish'
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
          $httpProvider.defaults.headers.common = {
            'Accept': 'application/json'
          };
          $httpProvider.defaults.headers.post = {
            'Content-Type': 'application/json'
          };
          $httpProvider.defaults.headers.put = {
            'Content-Type': 'application/json'
          };
          $httpProvider.defaults.headers.patch = {
            'Content-Type': 'application/json'
          };
        }
      ])
      .config([
        'ngToastProvider',
        function(ngToastProvider) {
          ngToastProvider.configure({
            animation: 'fade',
            timeout: 10000,
            dismissButton: true,
            maxNumber: 6
          });
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
