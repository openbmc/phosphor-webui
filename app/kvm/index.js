/**
 * A module for the kvm
 *
 * @module app/kvm/index
 * @exports app/kvm/index
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.kvm', [
            'ngRoute',
            'app.constants',
            'app.common.services'
        ])
        // Route configuration
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/kvm', {
                    'template': require('./controllers/kvm-controller.html'),
                    'controller': 'kvmController',
                    authenticated: true
                })
        }]);

})(window.angular);


