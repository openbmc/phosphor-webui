/**
 * Controller for server
 *
 * @module app/serverHealth
 * @exports inventoryOverviewController
 * @name inventoryOverviewController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverHealth')
        .controller('inventoryOverviewController', [
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
