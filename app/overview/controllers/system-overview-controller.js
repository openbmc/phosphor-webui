/**
 * Controller for systemOverview
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
            '$rootScope',
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            '$q',
            function($rootScope, $scope, $window, APIUtils, dataService, $q){
                $scope.dataService = dataService;
                $scope.dropdown_selected = false;
                $scope.tmz = 'EDT';
                $scope.logs = [];
                $scope.mac_address = "";
                $scope.bmc_info = {};
                $scope.bmc_firmware = "";
                $scope.server_firmware = "";
                $scope.power_consumption = "";
                $scope.power_cap = "";
                $scope.loading = false;

                loadOverviewData();
                function loadOverviewData(){
                    $scope.loading = true;
                    var promises = {
                      logs: APIUtils.getLogs(),
                      firmware: APIUtils.getFirmwares(),
                      led: APIUtils.getLEDState(),
                      ethernet: APIUtils.getBMCEthernetInfo(),
                      bmc_info: APIUtils.getBMCInfo(),
                      power_consumption: APIUtils.getPowerConsumption(),
                      power_cap: APIUtils.getPowerCap(),
                    };
                    $q.all(promises)
                      .then(function(data){
                        $scope.displayLogs(data.logs.data);
                        $scope.displayServerInfo(
                            data.firmware.data,
                            data.firmware.bmcActiveVersion,
                            data.firmware.hostActiveVersion
                        );
                        $scope.displayLEDState(data.led);
                        $scope.displayBMCEthernetInfo(data.ethernet);
                        $scope.displayBMCInfo(data.bmc_info);
                        $scope.displayPowerConsumption(data.power_consumption);
                        $scope.displayPowerCap(data.power_cap);
                      })
                      .finally(function(){
                        $scope.loading = false;
                      });
                }
                $scope.displayBMCEthernetInfo = function(data){
                    $scope.mac_address = data.MACAddress;
                }

                $scope.displayBMCInfo = function(data){
                    $scope.bmc_info = data;
                }

                $scope.displayLogs = function(data){
                    $scope.logs = data.filter(function(log){
                        return log.severity_flags.high == true;
                    });
                }

                $scope.displayServerInfo = function(data, bmcActiveVersion, hostActiveVersion){
                    $scope.bmc_firmware = bmcActiveVersion;
                    $scope.server_firmware = hostActiveVersion;
                }

                $scope.displayLEDState = function(state){
                    if(state == APIUtils.LED_STATE.on){
                        dataService.LED_state = APIUtils.LED_STATE_TEXT.on;
                    }else{
                        dataService.LED_state = APIUtils.LED_STATE_TEXT.off;
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

                $scope.displayPowerConsumption = function(data){
                    $scope.power_consumption = data;
                }

                $scope.displayPowerCap = function(data){
                    $scope.power_cap = data;
                }

                var refreshDataListener = $rootScope.$on('refresh-data', function(event, args) {
                    loadOverviewData();
                });

                $scope.$on('$destroy', function() {
                    refreshDataListener();
                });
            }
        ]
    );

})(angular);
