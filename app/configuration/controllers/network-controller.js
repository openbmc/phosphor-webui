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
                $scope.set_network_error = "";
                $scope.set_network_success = false;
                $scope.selectedInterface = "";
                $scope.confirm_settings = false;

                $scope.selectInterface = function(interfaceId){
                    $scope.interface = $scope.network.interfaces[interfaceId];
                    $scope.selectedInterface = interfaceId;
                    $scope.networkDevice = false;
                }
                $scope.confirmSetNetworkSettings = function(){
                    $scope.confirm_settings = true;
                }
                $scope.setNetworkSettings = function(){
                    // Hides the confirm network settings modal
                    $scope.confirm_settings = false;
                    $scope.set_network_error = "";
                    $scope.set_network_success = false;
                    // TODO: check if the network settings changed before setting
                    APIUtils.setNetworkSetting($scope.selectedInterface, "MACAddress", $scope.interface.MACAddress).then(function(data){
                        // DHCPEnabled must be set as 0 (false) or 1 (true)
                        APIUtils.setNetworkSetting($scope.selectedInterface, "DHCPEnabled", +$scope.interface.DHCPEnabled).then(function(data){

                            // Set IPV4 IP Addresses and gateways
                            for (var i in $scope.interface.ipv4.values) {
                                APIUtils.setIPV4NetworkSetting($scope.selectedInterface, $scope.interface.ipv4.ids[i], "Address", $scope.interface.ipv4.values[i].Address).then(function(data){
                                    APIUtils.setIPV4NetworkSetting($scope.selectedInterface, $scope.interface.ipv4.ids[i], "PrefixLength", $scope.interface.ipv4.values[i].PrefixLength).then(function(data){
                                        APIUtils.setIPV4NetworkSetting($scope.selectedInterface, $scope.interface.ipv4.ids[i], "Gateway", $scope.interface.ipv4.values[i].Gateway).then(function(data){},
                                        function(error){
                                            console.log(error);
                                            $scope.set_network_error = "Gateway";
                                            return;
                                        });
                                    },
                                    function(error){
                                        console.log(error);
                                        $scope.set_network_error = "Netmask";
                                        return;
                                    });
                                },
                                function(error){
                                    console.log(error);
                                    $scope.set_network_error = "IP Address";
                                    return;
                                });
                            }
                            // Due to github.com/openbmc/openbmc/issues/1641, the REST call may return good even though
                            // setting the network settings failed. Follow up the set with a get 4 seconds later to check
                            // if the set was successful.
                            $timeout(function() {
                                APIUtils.getNetworkInfo().then(function(data){
                                    if (data.formatted_data.interfaces[$scope.selectedInterface].MACAddress != $scope.interface.MACAddress)
                                    {
                                        $scope.set_network_error = "MAC Address";
                                    }
                                    if (data.formatted_data.interfaces[$scope.selectedInterface].DHCPEnabled != $scope.interface.DHCPEnabled)
                                    {
                                        $scope.set_network_error = "DHCP";
                                    }
                                    for (var i in $scope.interface.ipv4.values) {
                                        if (data.formatted_data.interfaces[$scope.selectedInterface].ipv4.values[i].Gateway != $scope.interface.ipv4.values[i].Gateway)
                                        {
                                            $scope.set_network_error = "Gateway";
                                        }
                                        if (data.formatted_data.interfaces[$scope.selectedInterface].ipv4.values[i].PrefixLength != $scope.interface.ipv4.values[i].PrefixLength)
                                        {
                                            $scope.set_network_error = "Netmask";
                                        }
                                        if (data.formatted_data.interfaces[$scope.selectedInterface].ipv4.values[i].Address != $scope.interface.ipv4.values[i].Address)
                                        {
                                            $scope.set_network_error = "IP Address";
                                        }
                                    }
                                    if (!$scope.set_network_error) {
                                        $scope.set_network_success = true;
                                    }
                                },
                                function(error){
                                    console.log(error);
                                    $scope.set_network_error = "network";
                                });
                            }, 4000);
                        },
                        function(error){
                            console.log(error);
                            $scope.set_network_error = "DHCP";
                        });
                    },
                    function(error){
                        console.log(error);
                        $scope.set_network_error = "MAC Address";
                    });
                }
                $scope.refresh = function(){
                    $route.reload();
                }
                APIUtils.getNetworkInfo().then(function(data){
                    $scope.network = data.formatted_data;
                    $scope.hostname = data.hostname;
                    $scope.defaultgateway = data.defaultgateway;
                    if($scope.network.interface_ids.length){
                       $scope.selectedInterface = $scope.network.interface_ids[0];
                       $scope.interface = $scope.network.interfaces[$scope.selectedInterface];
                    }
                });
            }
        ]
    );

})(angular);
