/**
 * Controller for bmc
 *
 * @module app/firmware
 * @exports bmcController
 * @name bmcController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.firmware')
        .controller('bmcController', [
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
