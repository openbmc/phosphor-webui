/**
 * Controller for unit Id
 *
 * @module app/overview
 * @exports unitIdController
 * @name unitIdController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('unitIdController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;
            }
        ]
    );

})(angular);
