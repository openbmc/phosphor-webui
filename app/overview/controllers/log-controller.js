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
        .controller('logController', [
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
