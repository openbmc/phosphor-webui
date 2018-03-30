/**
 * Controller for network
 *
 * @module app/configuration
 * @exports networkController
 * @name networkController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.configuration')
        .controller('networkController', [
            '$rootScope',
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            function($rootScope, $scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
                $scope.network = {};
                $scope.interface = {};
                $scope.networkDevice  = false;
                $scope.hostname = "";

                $scope.selectInterface = function(interfaceId){
                    $scope.interface = $scope.network.interfaces[interfaceId];
                    $scope.selectedInterface = interfaceId;
                    $scope.networkDevice = false;
                }
                $scope.refreshNetworkInfo = function (){
                    APIUtils.getNetworkInfo().then(function(data){
                        $scope.network = data.formatted_data;
                        $scope.hostname = data.hostname;
                        if($scope.network.interface_ids.length){
                            $scope.selectedInterface = $scope.network.interface_ids[0];
                            $scope.interface = $scope.network.interfaces[$scope.selectedInterface];
                        }
                    });
                }
                $scope.refreshNetworkInfo();

                var refreshDataListener = $rootScope.$on('refresh-data', function(event, args) {
                    $scope.refreshNetworkInfo();
                });

                $scope.$on('$destroy', function() {
                    refreshDataListener();
                });
            }
        ]
    );

})(angular);
