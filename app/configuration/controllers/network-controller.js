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
            '$q',
            function($scope, $window, APIUtils, dataService, $timeout, $route, $q){
                $scope.dataService = dataService;
                $scope.network = {};
                $scope.interface = {};
                $scope.interface_old = {};
                $scope.networkDevice  = false;
                $scope.hostname = "";
                $scope.default_gateway = "";
                $scope.set_network_error = "";
                $scope.set_network_success = false;
                $scope.selectedInterface = "";
                $scope.confirm_settings = false;
                $scope.loading = false;

                $scope.selectInterface = function(interfaceId){
                    $scope.interface = $scope.network.interfaces[interfaceId];
                    // Make a copy
                    $scope.interface_old = JSON.parse(JSON.stringify($scope.interface));
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
                    $scope.loading = true;
                    var promises = [];
                    var dataToVerify = {ipv4 : []};

                    $scope.interface.MACAddress = $scope.interface.MACAddress.toLowerCase();
                    if ($scope.interface.MACAddress != dataService.mac_address){
                        promises.push(setMACAddress());
                        dataToVerify['MACAddress'] = $scope.interface.MACAddress;
                    }

                    if ($scope.default_gateway != dataService.default_gateway){
                        promises.push(setDefaultGateway());
                        dataToVerify['DefaultGateway'] = $scope.default_gateway;
                    }

                    if ($scope.interface.DHCPEnabled != $scope.interface_old.DHCPEnabled){
                        promises.push(setDHCPEnabled());
                        dataToVerify['DHCPEnabled'] = $scope.interface.DHCPEnabled;
                    }

                    // Set IPV4 IP Addresses, Netmask Prefix Lengths
                    // and Gateways
                    if (!$scope.interface.DHCPEnabled){
                        for (var i in $scope.interface.ipv4.values)
                        {
                            if ($scope.interface.ipv4.values[i].Address !=
                                    $scope.interface_old.ipv4.values[i].Address ||
                                $scope.interface.ipv4.values[i].PrefixLength !=
                                    $scope.interface_old.ipv4.values[i].PrefixLength ||
                                $scope.interface.ipv4.values[i].Gateway !=
                                    $scope.interface_old.ipv4.values[i].Gateway)
                            {
                                promises.push(setIPV4(i));
                                dataToVerify.ipv4.push(
                                    {Address: $scope.interface.ipv4.values[i].Address,
                                     Gateway : $scope.interface.ipv4.values[i].Gateway,
                                     PrefixLength: $scope.interface.ipv4.values[i].PrefixLength});
                            }
                        }
                    }

                    $q.all(promises).then(function(data){
                        if (promises.length != 0) {
                            verifyNetworkSettings(dataToVerify);
                        } else {
                            $scope.loading = false;
                        }
                    }).catch(function(error){
                        console.log(JSON.stringify(error));
                        $scope.loading = false;
                    });
                }

                function setMACAddress(){
                    var deferred = $q.defer();
                    APIUtils.setMACAddress($scope.selectedInterface,
                            $scope.interface.MACAddress).then(function(data){
                        deferred.resolve(data);
                    }, function(error){
                        console.log(JSON.stringify(error));
                        $scope.set_network_error = "MAC Address";
                        deferred.reject(error);
                    });
                    return deferred.promise;
                }

                function setDefaultGateway(){
                    var deferred = $q.defer();
                    APIUtils.setDefaultGateway(
                            $scope.default_gateway).then(function(data){
                        deferred.resolve(data);
                    }, function(error){
                        console.log(JSON.stringify(error));
                        $scope.set_network_error = "Default Gateway";
                        deferred.reject(error);
                    });
                    return deferred.promise;
                }

                function setDHCPEnabled(){
                    var deferred = $q.defer();
                    // DHCPEnabled must be set as 0 (false) or 1 (true)
                    // NOTE: We might lose connection
                    APIUtils.setDHCPEnabled($scope.selectedInterface,
                            +$scope.interface.DHCPEnabled).then(function(data){
                        deferred.resolve(data);
                    }, function(error){
                        console.log(JSON.stringify(error));
                        $scope.set_network_error = "DHCP";
                        deferred.reject(error);
                    });
                    return deferred.promise;
                }

                function setIPV4(index){
                    var deferred = $q.defer();

                    // An edit is a delete and an add
                    APIUtils.deleteIPV4($scope.selectedInterface,
                        $scope.interface.ipv4.ids[index]).then(function(data)
                    {
                        APIUtils.addIPV4($scope.selectedInterface,
                                $scope.interface.ipv4.values[index].Address,
                                $scope.interface.ipv4.values[index].PrefixLength,
                                $scope.interface.ipv4.values[index].Gateway).then(function(data){
                            deferred.resolve(data);
                        },function(error){
                            console.log(JSON.stringify(error));
                            $scope.set_network_error = $scope.interface.ipv4.values[index].Address;
                            deferred.reject(error);
                        });
                    }, function(error){
                        console.log(JSON.stringify(error));
                        $scope.set_network_error = $scope.interface.ipv4.values[index].Address;
                        deferred.reject(error);
                    });

                    return deferred.promise;
                }

                function verifyNetworkSettings(dataToVerify){
                    // Due to github.com/openbmc/openbmc/issues/1641,
                    // the REST call may return good even though
                    // setting the network settings failed. Follow
                    // up the set with a get 22 seconds later to
                    // check if the set was successful.
                    // The update of the network settings is a lazy
                    // update. It is applied in the dbus object but
                    // is applied to the systemd network after 20 sec.
                    // Give it a buffer of 2 sec.
                    $timeout(function() {
                        APIUtils.getNetworkInfo().then(function(data){
                            dataService.setNetworkInfo(data);

                            if (dataToVerify.hasOwnProperty('MACAddress') &&
                                data.formatted_data.interfaces[$scope.selectedInterface].MACAddress !=
                                    dataToVerify.MACAddress){
                                $scope.set_network_error = "MAC Address";
                                return;
                            }

                            if (dataToVerify.hasOwnProperty('DHCPEnabled') &&
                                data.formatted_data.interfaces[$scope.selectedInterface].DHCPEnabled !=
                                    dataToVerify.DHCPEnabled){
                                $scope.set_network_error = "DHCP";
                                return;
                            }

                            if (dataToVerify.hasOwnProperty('DefaultGateway') &&
                                data.default_gateway != dataToVerify.DefaultGateway){
                                $scope.set_network_error = "Default Gateway";
                                return;
                            }

                            for (var i in dataToVerify.ipv4)
                            {
                                var found = false;
                                for (var j in data.formatted_data.interfaces[$scope.selectedInterface].ipv4.values)
                                {
                                    if (data.formatted_data.interfaces[$scope.selectedInterface].ipv4.values[j].Address ==
                                        dataToVerify.ipv4[i].Address)
                                    {
                                        found = true;
                                        if (data.formatted_data.interfaces[$scope.selectedInterface].ipv4.values[j].Gateway !=
                                            dataToVerify.ipv4[i].Gateway)
                                        {
                                            $scope.set_network_error = " Gateway";
                                            break;
                                        }
                                        if (data.formatted_data.interfaces[$scope.selectedInterface].ipv4.values[j].PrefixLength !=
                                            dataToVerify.ipv4[i].PrefixLength)
                                        {
                                            $scope.set_network_error = " Netmask Prefix Length";
                                            break;
                                        }
                                        break;
                                    }
                                }

                                if (!found || $scope.set_network_error != ''){
                                    $scope.set_network_error =
                                        dataToVerify.ipv4[i].Address + $scope.set_network_error;
                                    return;
                                }
                            }

                            if (!$scope.set_network_error){
                                $scope.set_network_success = true;
                                //Refresh stale data
                                getNetworkInfo()
                            }
                        },
                        function(error){
                            console.log(JSON.stringify(error));
                            $scope.set_network_error = "network";
                        }).finally(function(){
                            $scope.loading = false;
                        });
                    }, 22000);
                }

                $scope.refresh = function(){
                    $route.reload();
                }

                getNetworkInfo();
                function getNetworkInfo(){
                    APIUtils.getNetworkInfo().then(function(data){
                        dataService.setNetworkInfo(data);
                        $scope.network = data.formatted_data;
                        $scope.hostname = data.hostname;
                        $scope.default_gateway = data.default_gateway;
                        if($scope.network.interface_ids.length){
                           $scope.selectedInterface = $scope.network.interface_ids[0];
                           $scope.interface = $scope.network.interfaces[$scope.selectedInterface];
                            // Make a copy since we have to check which ip(s) need to be changed
                            $scope.interface_old = JSON.parse(JSON.stringify($scope.interface));
                        }
                    }, function(error){
                        console.log(JSON.stringify(error));
                    });
                }
            }
        ]
    );

})(angular);
