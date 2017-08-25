/**
 * A module for the multi-server
 *
 * @module app/multi-server
 * @exports app/multi-server
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.multiServer', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/multi-server/overview', {
                    'templateUrl': 'multi-server/controllers/multi-server-controller.html',
                    'controller': 'multiServerController',
                    authenticated: true
                });
        }]);

})(window.angular);
