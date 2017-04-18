/**
 * Controller for log
 *
 * @module app/overview
 * @exports logController
 * @name logController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('inventoryController', [
            '$scope',
            '$log',
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $log, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;

                $scope.dropdown_selected = false;

            }
        ]
    );

})(angular);
