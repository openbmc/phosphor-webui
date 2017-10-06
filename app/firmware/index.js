/**
 * A module for the firmware
 *
 * @module app/firmware/index
 * @exports app/firmware/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.firmware', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/firmware/bmc', {
                    'template': require('./controllers/bmc-controller.html'),
                    'controller': 'bmcController',
                    authenticated: true
                })
                .when('/firmware/server', {
                    'template': require('./controllers/server-controller.html'),
                    'controller': 'serverController',
                    authenticated: true
                })
                .when('/firmware', {
                    'template': reqire('./controllers/bmc-controller.html'),
                    'controller': 'bmcController',
                    authenticated: true
                });
        }]);

})(window.angular);
