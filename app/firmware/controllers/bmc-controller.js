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
            '$rootScope',
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            function($rootScope, $scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;

                var refreshDataListener = $rootScope.$on('refresh-data', function(event, args){
                    $scope.loadLogs();
                });

                $scope.$on('$destroy', function() {
                    refreshDataListener();
                });
            }
        ]
    );

})(angular);
