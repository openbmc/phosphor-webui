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
            '$route',
            function($scope, $window, APIUtils, dataService, $route){
                $scope.dataService = dataService;
                $scope.network = {};
                $scope.interface = {};
                $scope.networkDevice  = false;
                $scope.hostname = "";
                $scope.defaultgateway = "";
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
                    // TODO openbmc/openbmc#3165: check if the network settings
                    // changed before setting
                    APIUtils.setMACAddress($scope.selectedInterface, $scope.interface.MACAddress).then(function(data){
                        $scope.set_network_success = true;
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
