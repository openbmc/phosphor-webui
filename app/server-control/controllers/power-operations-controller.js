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
            'Constants',
            '$timeout',
            '$interval',
            '$q',
            function($scope, APIUtils, dataService, Constants, $timeout, $interval, $q){
                $scope.dataService = dataService;
                $scope.confirm = false;
                $scope.power_confirm = false;
                $scope.warmboot_confirm = false;
                $scope.coldboot_confirm = false;
                $scope.orderly_confirm = false;
                $scope.immediately_confirm = false;
                $scope.loading = false;

                var pollChassisStatusTimer = undefined;
                var pollHostStatusTimer = undefined;

                //@TODO: call api and get proper state
                $scope.toggleState = function(){
                    dataService.server_state = (dataService.server_state == 'Running') ? 'Off': 'Running';
                }

                $scope.togglePower = function(){
                    var method = (dataService.server_state == 'Running') ? 'hostPowerOff' : 'hostPowerOn';
                     //@TODO: show progress or set class orange
                    APIUtils[method]().then(function(response){
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

                function pollChassisStatusTillOff(){
                    var deferred = $q.defer();
                    pollChassisStatusTimer = $interval(function(){
                      APIUtils.getChassisState().then(function(state){
                        if(state === Constants.CHASSIS_POWER_STATE.off_code){
                           $interval.cancel(pollChassisStatusTimer);
                           pollChassisStatusTimer = undefined;
                           deferred.resolve(state);
                        }
                      }).catch(function(error){
                        $interval.cancel(pollChassisStatusTimer);
                        pollChassisStatusTimer = undefined;
                        deferred.reject(error);
                      });
                    }, Constants.POLL_INTERVALS.CHASSIS_STATUS);

                    return deferred.promise;
                }
                function pollHostStatusTillOn(){
                    var deferred = $q.defer();
                    pollHostStatusTimer = $interval(function(){
                      APIUtils.getHostState().then(function(state){
                        if(state === Constants.HOST_STATE_TEXT.on_code){
                           $interval.cancel(pollHostStatusTimer);
                           pollHostStatusTimer = undefined;
                           deferred.resolve(state);
                        }
                      }).catch(function(error){
                        $interval.cancel(pollHostStatusTimer);
                        pollHostStatusTimer = undefined;
                        deferred.reject(error);
                      });
                    }, Constants.POLL_INTERVALS.HOST_STATUS);

                    return deferred.promise;
                }
                $scope.warmReboot = function(){
                    $scope.loading = true;
                    dataService.setBootingState();
                    APIUtils.hostReboot().then(function(state){
                      return state;
                    }).then(function(hostState) {
                        pollHostStatusTillOn().then(function(state) {
                            dataService.setPowerOnState();
                            $scope.loading = false;
                        });
                    }).catch(function(error){
                        $scope.loading = false;
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
                    $scope.loading = true;
                    dataService.setBootingState();
                    APIUtils.chassisPowerOff().then(function(state){
                      return state;
                    }).then(function(lastState) {
                        pollChassisStatusTillOff().then(function(chassisState) {
                            return chassisState;
                        });
                    }).then(function(chassisState) {
                        APIUtils.hostPowerOn().then(function(hostState){
                            return hostState;
                        })
                    }).then(function(hostState) {
                        pollHostStatusTillOn().then(function(state) {
                            dataService.setPowerOnState();
                            $scope.loading = false;
                        });
                    }).catch(function(error){
                        $scope.loading = false;
                    });
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
                    APIUtils.hostPowerOff().then(function(response){
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
                    //@TODO:show progress
                    APIUtils.chassisPowerOff(function(response){
                        if(response){
                            dataService.setPowerOffState();
                        }else{
                            //@TODO:hide progress & show error message
                        }
                    });
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
