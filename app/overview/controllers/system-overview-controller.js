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
                $scope.server_info = {};
                $scope.bmc_firmware = "";
                $scope.bmc_time = "";
                $scope.server_firmware = "";
                $scope.power_consumption = "";
                $scope.power_cap = "";
                $scope.bmc_ip_addresses = [];
                $scope.loading = false;
                $scope.edit_server_name = false;

                loadOverviewData();
                function loadOverviewData(){
                    $scope.loading = true;

                    var getLogsPromise =
                        APIUtils.getLogs().then(function(data){
                            console.log("Logs");
                            $scope.logs = data.data.filter(function(log){
                                return log.severity_flags.high == true;
                            });
                    })

                    var getFirmwaresPromise =
                        APIUtils.getFirmwares().then(function(data){
                            console.log("Firmwares");
                            $scope.bmc_firmware = data.bmcActiveVersion;
                            $scope.server_firmware = data.hostActiveVersion;
                    })

                    var getLEDStatePromise =
                        APIUtils.getLEDState().then(function(data){
                            console.log("LEDState");
                            if(data == APIUtils.LED_STATE.on){
                                dataService.LED_state = APIUtils.LED_STATE_TEXT.on;
                            }else{
                                dataService.LED_state = APIUtils.LED_STATE_TEXT.off;
                            }
                    })

                    var getBMCTimePromise =
                        APIUtils.getBMCTime().then(function(data){
                            console.log("BMCTime");
                            $scope.bmc_time = data.data.Elapsed / 1000;
                    })

                    var getServerInfoPromise =
                        APIUtils.getServerInfo().then(function(data){
                            console.log("ServerInfo");
                            $scope.server_info = data.data;
                    })

                    var getPowerConsumptionPromise =
                        APIUtils.getPowerConsumption().then(function(data){
                            console.log("PowerConsumption");
                            $scope.power_consumption = data;
                    })

                    var getPowerCapPromise =
                        APIUtils.getPowerCap().then(function(data){
                            console.log("PowerCap");
                            $scope.power_cap = data;
                        }, function(error) {
                            console.log(JSON.stringify(error));
                        })

                    var getNetworkInfoPromise =
                        APIUtils.getNetworkInfo().then(function(data){
                            console.log("NetworkInfo");
                            // TODO: openbmc/openbmc#3150 Support IPV6 when
                            // officially supported by the backend
                            $scope.bmc_ip_addresses =
                                data.formatted_data.ip_addresses.ipv4;
                    })

                    var promises = [
                        getLogsPromise,
                        getFirmwaresPromise,
                        getLEDStatePromise,
                        getBMCTimePromise,
                        getServerInfoPromise,
                        getPowerConsumptionPromise,
                        getPowerCapPromise,
                        getNetworkInfoPromise,
                    ];

                    $q.all(promises).finally(function(){
                        $scope.loading = false;
                    });
                }

                $scope.toggleLED = function(){
                    var toggleState = (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
                        APIUtils.LED_STATE.off : APIUtils.LED_STATE.on;
                        dataService.LED_state = (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
                        APIUtils.LED_STATE_TEXT.off : APIUtils.LED_STATE_TEXT.on;
                    APIUtils.setLEDState(toggleState, function(status){
                    });
                }

                $scope.saveHostname = function(hostname) {
                    $scope.edit_server_name = false;
                    $scope.loading = true;
                    APIUtils.setHostname(hostname).then(function(data){
                        APIUtils.getNetworkInfo().then(function(data){
                            dataService.setNetworkInfo(data);
                        });
                    },
                    function(error){
                        console.log(error);
                    });
                    $scope.loading = false;
                }
            }
        ]
    );

})(angular);
