/**
 * Controller for server
 *
 * @module app/serverControl
 * @exports remoteConsoleController
 * @name remoteConsoleController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverControl')
        .controller('remoteConsoleController', [
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
