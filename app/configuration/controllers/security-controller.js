/**
 * Controller for security
 *
 * @module app/configuration
 * @exports securityController
 * @name securityController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.configuration')
        .controller('securityController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
            }
        ]
    );

})(angular);
