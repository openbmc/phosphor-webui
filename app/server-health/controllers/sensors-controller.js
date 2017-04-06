/**
 * Controller for sensors
 *
 * @module app/serverHealth
 * @exports sensorsController
 * @name sensorsController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('sensorsController', [
            '$scope',
            '$log',
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $log, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;

                $scope.dropdown_selected = false;

                $scope.$log = $log;
                $scope.message = 'Hello World!';
            }
        ]
    );

})(angular);