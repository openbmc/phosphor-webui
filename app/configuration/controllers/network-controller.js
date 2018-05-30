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
      $scope.old_interface = {};
      $scope.interface = {};
      $scope.networkDevice = false;
      $scope.hostname = '';
      $scope.old_defaultgateway = '';
      $scope.defaultgateway = '';
      $scope.set_network_error = '';
      $scope.set_network_success = false;
      $scope.selectedInterface = '';
      $scope.confirm_settings = false;

      $scope.selectInterface = function(interfaceId) {
        $scope.interface = $scope.network.interfaces[interfaceId];
        // Copy the interface so we know later if changes were made to the page
        $scope.old_interface = JSON.parse(JSON.stringify($scope.interface));
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
        if ($scope.defaultgateway != $scope.old_defaultgateway) {
          promises.push(setDefaultGateway());
        }
        if ($scope.hostname != dataService.hostname) {
          promises.push(setHostname());
        }

        // Set IPV4 IP Addresses, Netmask Prefix Lengths, and Gateways
        if (!$scope.interface.DHCPEnabled) {
          for (var i in $scope.interface.ipv4.values) {
            if ($scope.interface.ipv4.values[i].Address !=
                    $scope.old_interface.ipv4.values[i].Address ||
                $scope.interface.ipv4.values[i].PrefixLength !=
                    $scope.old_interface.ipv4.values[i].PrefixLength ||
                $scope.interface.ipv4.values[i].Gateway !=
                    $scope.old_interface.ipv4.values[i].Gateway) {
              promises.push(setIPV4(i));
            }
          }
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
                  console.log(error);
                  $scope.set_network_error = 'MAC Address';
                });
      }

      function setDefaultGateway() {
        return APIUtils.setDefaultGateway($scope.defaultgateway)
            .then(
                function(data) {},
                function(error) {
                  console.log(error);
                  $scope.set_network_error = 'Default Gateway';
                });
      }

      function setHostname() {
        return APIUtils.setHostname($scope.hostname)
            .then(
                function(data) {},
                function(error) {
                  console.log(error);
                  $scope.set_network_error = 'Hostname';
                });
      }

      function setIPV4(index) {
        // The correct way to edit an IPV4 interface is to remove it and then
        // add a new one
        return APIUtils
            .deleteIPV4(
                $scope.selectedInterface, $scope.interface.ipv4.ids[index])
            .then(
                function(data) {
                  return APIUtils
                      .addIPV4(
                          $scope.selectedInterface,
                          $scope.interface.ipv4.values[index].Address,
                          $scope.interface.ipv4.values[index].PrefixLength,
                          $scope.interface.ipv4.values[index].Gateway)
                      .then(
                          function(data) {},
                          function(error) {
                            console.log(error);
                            $scope.set_network_error =
                                $scope.interface.ipv4.values[index].Address;
                          });
                },
                function(error) {
                  console.log(error);
                  $scope.set_network_error =
                      $scope.interface.ipv4.values[index].Address;
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
        $scope.old_defaultgateway = $scope.defaultgateway;
        if ($scope.network.interface_ids.length) {
          $scope.selectedInterface = $scope.network.interface_ids[0];
          $scope.interface =
              $scope.network.interfaces[$scope.selectedInterface];
          // Copy the interface so we know later if changes were made to the
          // page
          $scope.old_interface = JSON.parse(JSON.stringify($scope.interface));
        }
      });
    }
  ]);

})(angular);
