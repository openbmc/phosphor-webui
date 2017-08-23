/**
 * Controller for index
 *
 * @module app/multi-server
 * @exports indexController
 * @name indexController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('indexController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
                $scope.loading = false;

            }
        ]
    );

})(angular);