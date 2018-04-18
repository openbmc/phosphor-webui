/**
 * Controller for network
 *
 * @module app/configuration
 * @exports networkController
 * @name networkController
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.configuration')
        .controller('networkController', [
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            '$timeout',
            function($scope, $window, APIUtils, dataService, $timeout){
                $scope.dataService = dataService;
                $scope.network = {};
                $scope.interface = {};
                $scope.networkDevice  = false;
                $scope.hostname = "";
                $scope.set_network_errors = "";
                $scope.set_network_success = false;
                $scope.selectedInterface = "";

                $scope.selectInterface = function(interfaceId){
                    $scope.interface = $scope.network.interfaces[interfaceId];
                    $scope.selectedInterface = interfaceId;
                    $scope.networkDevice = false;
                }
                $scope.setNetworkSettings = function(){
                    $scope.set_network_errors = "";
                    $scope.set_network_success = false;
                    // TODO: check if the network settings changed before setting
                    APIUtils.setNetworkSetting($scope.selectedInterface, "MACAddress", $scope.interface.MACAddress).then(function(data){
                        // Due to github.com/openbmc/openbmc/issues/1641, the REST call may return good even though
                        // setting the MAC address failed. Follow up the set with a get 2 seconds later to check
                        // if the set was successful.
                        $timeout(function() {
                            APIUtils.getNetworkInfo().then(function(data){
                                if (data.formatted_data != $scope.network)
                                {
                                    $scope.set_network_errors = $scope.set_network_errors + "MAC Address";
                                }
                                else
                                {
                                    $scope.set_network_success = true;
                                }
                            },
                            function(error){
                                console.log(error);
                                $scope.set_network_errors = $scope.set_network_errors + "MAC Address";
                            });
                        }, 2000);
                    },
                    function(error){
                        console.log(error);
                        $scope.set_network_errors = $scope.set_network_errors + "MAC Address";
                    });
                }
                APIUtils.getNetworkInfo().then(function(data){
                    $scope.network = data.formatted_data;
                    $scope.hostname = data.hostname;
                    if($scope.network.interface_ids.length){
                       $scope.selectedInterface = $scope.network.interface_ids[0];
                       $scope.interface = $scope.network.interfaces[$scope.selectedInterface];
                    }
                });
            }
        ]
    );

})(angular);
