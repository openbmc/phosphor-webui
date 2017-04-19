/**
 * Controller for server
 *
 * @module app/serverHealth
 * @exports diagnosticsController
 * @name diagnosticsController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverHealth')
        .controller('diagnosticsController', [
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
