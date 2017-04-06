/**
 * Controller for server
 *
 * @module app/serverHealth
 * @exports powerConsumptionController
 * @name powerConsumptionController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverHealth')
        .controller('powerConsumptionController', [
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
