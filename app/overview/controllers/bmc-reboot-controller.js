/**
 * Controller for bmc-reboot
 *
 * @module app/overview
 * @exports bmcRebootController
 * @name bmcRebootController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('bmcRebootController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
                $scope.confirm = false;
                $scope.rebootConfirm = function(){
                    if($scope.confirm) {
                        return;
                    }
                    $scope.confirm = true;
                };
                $scope.reboot = function(){
                    dataService.setBootingState();
                    APIUtils.bmcReboot(function(response){
                        if(response){
                            dataService.setPowerOnState();
                        }else{
                            dataService.setUnreachableState();
                        }
                    });
                };
            }
        ]
    );

})(angular);
