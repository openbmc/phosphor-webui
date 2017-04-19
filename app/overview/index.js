/**
 * A module for the overview
 *
 * @module app/overview/index
 * @exports app/overview/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/overview/system', {
                    'templateUrl': 'overview/controllers/system-overview-controller.html',
                    'controller': 'systemOverviewController',
                    authenticated: true
                })
                .when('/overview', {
                    'templateUrl': 'overview/controllers/system-overview-controller.html',
                    'controller': 'systemOverviewController',
                    authenticated: true
                });
        }]);

})(window.angular);
