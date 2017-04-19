/**
 * Controller for power-operations
 *
 * @module app/serverControl
 * @exports powerOperationsController
 * @name powerOperationsController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverControl')
        .controller('powerOperationsController', [
            '$scope', 
            'APIUtils', 
            'dataService', 
            '$timeout', 
            function($scope, APIUtils, dataService, $timeout){
                $scope.dataService = dataService;
                $scope.confirm = false;
                $scope.power_confirm = false;
                $scope.warmboot_confirm = false;
                $scope.coldboot_confirm = false;
                $scope.orderly_confirm = false;
                $scope.immediately_confirm = false;

                //@TODO: call api and get proper state
                $scope.toggleState = function(){
                    dataService.server_state = (dataService.server_state == 'Running') ? 'Off': 'Running';
                }

                $scope.togglePower = function(){
                    var method = (dataService.server_state == 'Running') ? 'hostPowerOff' : 'hostPowerOn';
                     //@TODO: show progress or set class orange
                    APIUtils[method](function(response){
                        //update state based on response
                        //error case?
                        if(response == null){
                            console.log("Failed request.");
                        }else{
                            //@TODO::need to get the server status
                            if(dataService.server_state == 'Running'){
                                dataService.setPowerOffState();
                            }else{
                                dataService.setPowerOnState();
                            }
                        }
                    });
                }
                $scope.powerOnConfirm = function(){
                    if($scope.confirm) {
                        return;
                    }
                    $scope.confirm = true;
                    $scope.power_confirm = true;
                };
                $scope.warmReboot = function(){
                    //@TODO:show progress
                    dataService.setBootingState();
                    APIUtils.hostPowerOff(function(response){
                        if(response){
                            APIUtils.hostPowerOn(function(response){
                                if(response){
                                    dataService.setPowerOnState();
                                }else{
                                    //@TODO:show error message
                                }
                            });
                        }else{
                        }
                    });
                };
                $scope.testState = function(){
                    $timeout(function(){
                        dataService.setPowerOffState();
                        $timeout(function(){
                            dataService.setPowerOnState();
                        }, 2000);
                    }, 1000);
                };
                $scope.warmRebootConfirm = function(){
                    if($scope.confirm) {
                        return;
                    }
                    $scope.confirm = true;
                    $scope.warmboot_confirm = true;
                };

                $scope.coldReboot = function(){
                    $scope.warmReboot();
                };
                $scope.coldRebootConfirm = function(){
                    if($scope.confirm) {
                        return;
                    }
                    $scope.confirm = true;
                    $scope.coldboot_confirm = true;
                };

                $scope.orderlyShutdown = function(){
                    //@TODO:show progress
                    APIUtils.hostPowerOff(function(response){
                        if(response){
                            dataService.setPowerOffState();
                        }else{
                            //@TODO:hide progress & show error message
                        }
                    });
                };
                $scope.orderlyShutdownConfirm = function(){
                    if($scope.confirm) {
                        return;
                    }
                    $scope.confirm = true;
                    $scope.orderly_confirm = true;
                };

                $scope.immediateShutdown = function(){
                    $scope.orderlyShutdown();
                };
                $scope.immediateShutdownConfirm = function(){
                    if($scope.confirm) {
                        return;
                    }
                    $scope.confirm = true;
                    $scope.immediately_confirm = true;
                };
            }
        ]
    );

})(angular);
