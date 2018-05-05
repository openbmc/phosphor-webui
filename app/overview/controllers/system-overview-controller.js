/**
 * Controller for systemOverview
 *
 * @module app/overview
 * @exports systemOverviewController
 * @name systemOverviewController
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
            '$q',
            function($scope, $window, APIUtils, dataService, $q){
                $scope.dataService = dataService;
                $scope.dropdown_selected = false;
                $scope.tmz = 'EDT';
                $scope.logs = [];
                $scope.mac_address = "";
                $scope.bmc_info = {};
                $scope.server_info = {};
                $scope.bmc_firmware = "";
                $scope.server_firmware = "";
                $scope.power_consumption = "";
                $scope.power_cap = "";
                $scope.loading = false;

                loadOverviewData();
                function loadOverviewData(){
                    $scope.loading = true;

                    //$q.all combines multiple promises into a single
                    //promise that is resolved when all of the input
                    //promises are resolved. It allows for all the input
                    //promises to be resolved in parallel. If one of the
                    //input promises failed, the returned promise is
                    //immediately rejected, not waiting for the rest of
                    //the batch. This wrapper is added to handle any
                    //rejected input promises such that the remaining
                    //input promises can still get resolved. This is so
                    //we can get as much data as possible when loading
                    //the page.
                    var apiutilsWrapper = function(apiutilsFunction){
                        return apiutilsFunction().then(function(response){
                            return response;
                        }, function(error) {
                            console.log(JSON.stringify(error));
                            return null;
                        });
                    }

                    var promises = {
                      logs: apiutilsWrapper(APIUtils.getLogs),
                      firmware: apiutilsWrapper(APIUtils.getFirmwares),
                      led: apiutilsWrapper(APIUtils.getLEDState),
                      ethernet: apiutilsWrapper(APIUtils.getBMCEthernetInfo),
                      bmc_info: apiutilsWrapper(APIUtils.getBMCInfo),
                      server_info: apiutilsWrapper(APIUtils.getServerInfo),
                      power_consumption: apiutilsWrapper(APIUtils.getPowerConsumption),
                      power_cap: apiutilsWrapper(APIUtils.getPowerCap),
                    };
                    $q.all(promises)
                      .then(function(data){
                        $scope.displayLogs(data.logs);
                        $scope.displayServerInfo(
                            data.server_info,
                            data.firmware
                        );
                        $scope.displayLEDState(data.led);
                        $scope.displayBMCEthernetInfo(data.ethernet);
                        $scope.displayBMCInfo(
                            data.bmc_info,
                            data.firmware
                        );
                        $scope.displayPowerConsumption(data.power_consumption);
                        $scope.displayPowerCap(data.power_cap);
                      })
                      .finally(function(){
                        $scope.loading = false;
                      });
                }

                $scope.displayBMCEthernetInfo = function(ethernet){
                    if (ethernet) {
                        $scope.mac_address = ethernet.MACAddress;
                    }
                }
                $scope.displayBMCInfo = function(bmc_info, firmware){
                    if (bmc_info){
                        $scope.bmc_info = bmc_info;
                    }
                    if (firmware){
                        $scope.bmc_firmware = firmware.bmcActiveVersion;
                    }
                }

                $scope.displayLogs = function(logs){
                    if (logs){
                        $scope.logs = logs.data.filter(function(log){
                            return log.severity_flags.high == true;
                        });
                    }
                }

                $scope.displayServerInfo = function(server_info, firmware){
                    if (server_info) {
                        $scope.server_info = server_info.data;
                    }
                    if (firmware) {
                        $scope.server_firmware = firmware.hostActiveVersion;
                    }
                }

                $scope.displayLEDState = function(led){
                    if (led){
                        if(led == APIUtils.LED_STATE.on){
                            dataService.LED_state = APIUtils.LED_STATE_TEXT.on;
                        }else{
                            dataService.LED_state = APIUtils.LED_STATE_TEXT.off;
                        }
                    }
                }

                $scope.toggleLED = function(){
                    var toggleState = (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
                        APIUtils.LED_STATE.off : APIUtils.LED_STATE.on;
                        dataService.LED_state = (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
                        APIUtils.LED_STATE_TEXT.off : APIUtils.LED_STATE_TEXT.on;
                    APIUtils.setLEDState(toggleState, function(status){
                    });
                }

                $scope.displayPowerConsumption = function(power_consumption){
                    if (power_consumption){
                        $scope.power_consumption = power_consumption;
                    }
                }

                $scope.displayPowerCap = function(power_cap){
                    if (power_cap){
                        $scope.power_cap = power_cap;
                    }
                }
            }
        ]
    );

})(angular);
