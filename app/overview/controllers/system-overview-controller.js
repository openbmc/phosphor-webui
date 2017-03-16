/**
 * Controller for system overview
 *
 * @module app/overview
 * @exports systemOverviewController
 * @name systemOverviewController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('systemOverviewController', [
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
