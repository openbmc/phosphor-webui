/**
 * Controller for network
 *
 * @module app/configuration
 * @exports networkController
 * @name networkController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('networkController', [
    '$scope', '$window', 'APIUtils', 'dataService', '$route', '$q',
    function($scope, $window, APIUtils, dataService, $route, $q) {
      $scope.dataService = dataService;
      $scope.network = {};
      $scope.interface = {};
      $scope.networkDevice = false;
      $scope.hostname = '';
      $scope.defaultgateway = '';
      $scope.set_network_error = '';
      $scope.set_network_success = false;
      $scope.selectedInterface = '';
      $scope.confirm_settings = false;

      $scope.selectInterface = function(interfaceId) {
        $scope.interface = $scope.network.interfaces[interfaceId];
        $scope.selectedInterface = interfaceId;
        $scope.networkDevice = false;
      };
      $scope.setNetworkSettings = function() {
        // Hides the confirm network settings modal
        $scope.confirm_settings = false;
        $scope.set_network_error = '';
        $scope.set_network_success = false;
        var promises = [];

        // MAC Address are case-insensitive
        if ($scope.interface.MACAddress.toLowerCase() !=
            dataService.mac_address.toLowerCase()) {
          promises.push(setMACAddress());
        }
        if ($scope.defaultgateway != dataService.defaultgateway) {
          promises.push(setDefaultGateway());
        }
        if ($scope.hostname != dataService.hostname) {
          promises.push(setHostname());
        }

        if (promises.length) {
          $q.all(promises).finally(function() {
            if (!$scope.set_network_error) {
              $scope.set_network_success = true;
            }
          });
        }

      };

      function setMACAddress() {
        return APIUtils
            .setMACAddress(
                $scope.selectedInterface, $scope.interface.MACAddress)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.set_network_error = 'MAC Address';
                });
      }

      function setDefaultGateway() {
        return APIUtils.setDefaultGateway($scope.defaultgateway)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.set_network_error = 'Default Gateway';
                });
      }

      function setHostname() {
        return APIUtils.setHostname($scope.hostname)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.set_network_error = 'Hostname';
                });
      }

      $scope.refresh = function() {
        $route.reload();
      };
      APIUtils.getNetworkInfo().then(function(data) {
        dataService.setNetworkInfo(data);
        $scope.network = data.formatted_data;
        $scope.hostname = data.hostname;
        $scope.defaultgateway = data.defaultgateway;
        if ($scope.network.interface_ids.length) {
          $scope.selectedInterface = $scope.network.interface_ids[0];
          $scope.interface =
              $scope.network.interfaces[$scope.selectedInterface];
        }
      });
    }
  ]);

})(angular);
