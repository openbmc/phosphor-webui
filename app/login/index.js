/**
 * A module for the login
 *
 * @module app/login/index
 * @exports app/login/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.login', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
<<<<<<< HEAD
                .when('/login/:fake_login', {
                    'templateUrl': 'login/controllers/login-controller.html',
                    'controller': 'LoginController',
                    authenticated: false
                })
=======
>>>>>>> 4c1a3dd... Major update to code structure
                .when('/login', {
                    'templateUrl': 'login/controllers/login-controller.html',
                    'controller': 'LoginController',
                    authenticated: false
                });
        }]);

})(window.angular);
