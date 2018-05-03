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
            '$route',
            function($scope, $window, APIUtils, dataService, $timeout, $route){
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
                        // DHCPEnabled must be set as 0 (false) or 1 (true)
                        APIUtils.setNetworkSetting($scope.selectedInterface, "DHCPEnabled", +$scope.interface.DHCPEnabled).then(function(data){

                            // Due to github.com/openbmc/openbmc/issues/1641, the REST call may return good even though
                            // setting the network settings failed. Follow up the set with a get 4 seconds later to check
                            // if the set was successful.
                            $timeout(function() {
                                APIUtils.getNetworkInfo().then(function(data){
                                    if (data.formatted_data.interfaces[$scope.selectedInterface].MACAddress != $scope.network.interfaces[$scope.selectedInterface].MACAddress)
                                    {
                                        $scope.set_network_errors = $scope.set_network_errors + "MAC Address";
                                    }
                                    if (data.formatted_data.interfaces[$scope.selectedInterface].DHCPEnabled != $scope.network.interfaces[$scope.selectedInterface].DHCPEnabled)
                                    {
                                        $scope.set_network_errors = $scope.set_network_errors + "DHCP";
                                    }
                                    if (!$scope.set_network_errors) {
                                        $scope.set_network_success = true;
                                    }
                                },
                                function(error){
                                    console.log(error);
                                    $scope.set_network_errors = $scope.set_network_errors + "MAC Address, DHCP";
                                });
                            }, 4000);
                        },
                        function(error){
                            console.log(error);
                            $scope.set_network_errors = $scope.set_network_errors + "DHCP";
                        });
                    },
                    function(error){
                        console.log(error);
                        $scope.set_network_errors = $scope.set_network_errors + "MAC Address";
                    });
                }
                $scope.refresh = function(){
                    $route.reload();
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
