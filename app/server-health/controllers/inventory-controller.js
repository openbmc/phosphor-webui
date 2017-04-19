/**
 * Controller for server
 *
 * @module app/serverHealth
 * @exports inventoryController
 * @name inventoryController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverHealth')
        .controller('inventoryController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;

                // Force to top of page when viewing single group
                $window.scrollTo(0, 0);
            }
        ]
    );

})(angular);
