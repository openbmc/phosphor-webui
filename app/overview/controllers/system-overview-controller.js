/**
<<<<<<< HEAD
 * Controller for systemOverview
=======
 * Controller for system overview
>>>>>>> 4c1a3dd... Major update to code structure
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
<<<<<<< HEAD
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
                $scope.dropdown_selected = false;
                $scope.tmz = 'EDT';
                $scope.logs = [];
                $scope.mac_address = "";
                $scope.bmc_info = {};
                $scope.bmc_firmware = "";
                $scope.server_firmware = "";

                loadOverviewData();
                function loadOverviewData(){
                    APIUtils.getLogs(function(data){
                       $scope.displayLogs(data);
                    });
                    APIUtils.getFirmwares(function(data, bmcActiveVersion, hostActiveVersion){
                       $scope.displayServerInfo(data, bmcActiveVersion, hostActiveVersion);
                    });
                    APIUtils.getLEDState(function(state){
                       $scope.displayLEDState(state);
                    });
                    APIUtils.getBMCEthernetInfo(function(data){
                       $scope.displayBMCEthernetInfo(data);
                    });
                    APIUtils.getBMCInfo(function(data){
                       $scope.displayBMCInfo(data);
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
=======
            function($scope, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;
>>>>>>> 4c1a3dd... Major update to code structure
            }
        ]
    );

<<<<<<< HEAD
})(angular);
=======
})(angular);
>>>>>>> 4c1a3dd... Major update to code structure
