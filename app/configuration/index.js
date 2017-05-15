/**
 * A module for the configuration
 *
 * @module app/configuration/index
 * @exports app/configuration/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.configuration', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/configuration/network', {
                    'templateUrl': 'configuration/controllers/network-controller.html',
                    'controller': 'networkController',
                    authenticated: true
                })
                .when('/configuration/security', {
                    'templateUrl': 'configuration/controllers/security-controller.html',
                    'controller': 'securityController',
                    authenticated: true
                }).when('/configuration/date-time', {
                    'templateUrl': 'configuration/controllers/date-time-controller.html',
                    'controller': 'dateTimeController',
                    authenticated: true
                })
                .when('/configuration/file', {
                    'templateUrl': 'configuration/controllers/file-controller.html',
                    'controller': 'fileController',
                    authenticated: true
                }).when('/configuration', {
                    'templateUrl': 'configuration/controllers/network-controller.html',
                    'controller': 'networkController',
                    authenticated: true
                }).when('/configuration/firmware', {
                'templateUrl': 'configuration/controllers/firmware-controller.html',
                'controller': 'firmwareController',
                authenticated: true
            });
        }]);

})(window.angular);
