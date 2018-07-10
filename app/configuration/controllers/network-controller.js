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
    '$scope', '$window', 'APIUtils', 'dataService', '$timeout', '$route', '$q',
    function($scope, $window, APIUtils, dataService, $timeout, $route, $q) {
      $scope.dataService = dataService;
      $scope.network = {};
      $scope.old_interface = {};
      $scope.interface = {};
      $scope.networkDevice = false;
      $scope.hostname = '';
      $scope.defaultgateway = '';
      $scope.set_network_error = '';
      $scope.set_network_success = false;
      $scope.selectedInterface = '';
      $scope.confirm_settings = false;
      $scope.loading = false;

      loadNetworkInfo();

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
        $scope.loading = true;
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
        if ($scope.interface.DHCPEnabled != $scope.old_interface.DHCPEnabled) {
          promises.push(setDHCPEnabled());
        }

        // Remove any empty strings from the array. Important because we add an
        // empty string to the end so the user can add a new DNS server, if the
        // user doesn't fill out the field, we don't want to add.
        $scope.interface.Nameservers =
            $scope.interface.Nameservers.filter(Boolean);
        // toString() is a cheap way to compare 2 string arrays
        if ($scope.interface.Nameservers.toString() !=
            $scope.old_interface.Nameservers.toString()) {
          promises.push(setNameservers());
        }

        // Set IPV4 IP Addresses, Netmask Prefix Lengths, and Gateways
        if (!$scope.interface.DHCPEnabled) {
          for (var i in $scope.interface.ipv4.values) {
            if (!APIUtils.validIPV4IP(
                    $scope.interface.ipv4.values[i].Address)) {
              $scope.set_network_error =
                  $scope.interface.ipv4.values[i].Address +
                  ' invalid IP parameter';
              $scope.loading = false;
              return;
            }
            if (!APIUtils.validIPV4IP(
                    $scope.interface.ipv4.values[i].Gateway)) {
              $scope.set_network_error =
                  $scope.interface.ipv4.values[i].Address +
                  ' invalid gateway parameter';
              $scope.loading = false;
              return;
            }
            // The netmask prefix length will be undefined if outside range
            if (!$scope.interface.ipv4.values[i].PrefixLength) {
              $scope.set_network_error =
                  $scope.interface.ipv4.values[i].Address +
                  ' invalid Prefix Length parameter';
              $scope.loading = false;
              return;
            }
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
            $scope.loading = false;
            if (!$scope.set_network_error) {
              $scope.set_network_success = true;
              // Since an IPV4 interface (e.g. IP address, gateway, or netmask)
              // edit is a delete then an add and the GUI can't calculate the
              // interface id (e.g. 5c083707) beforehand and it is not returned
              // by the REST call, openbmc#3227, reload the page after an edit,
              // which makes a 2nd REST call.
              // Do this for all network changes due to the possibility of a set
              // network failing even though it returned success, openbmc#1641,
              // and to update dataService and old_interface to know which
              // data has changed if the user continues to edit network
              // settings.
              // TODO: The reload is not ideal. Revisit this.
              $timeout(function() {
                loadNetworkInfo();
              }, 4000);
            }
          });
        } else {
          $scope.loading = false;
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

      function setDHCPEnabled() {
        return APIUtils
            .setDHCPEnabled(
                $scope.selectedInterface, $scope.interface.DHCPEnabled)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.set_network_error = 'DHCP';
                });
      }

      function setNameservers() {
        // Nameservers does not allow an empty array, since we remove all empty
        // strings above, could have an empty array.
        if ($scope.interface.Nameservers.length == 0) {
          $scope.interface.Nameservers.push('');
        }
        return APIUtils
            .setNameservers(
                $scope.selectedInterface, $scope.interface.Nameservers)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.set_network_error = 'DNS Servers';
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
                            console.log(JSON.stringify(error));
                            $scope.set_network_error =
                                $scope.interface.ipv4.values[index].Address;
                          });
                },
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.set_network_error =
                      $scope.interface.ipv4.values[index].Address;
                });
      }

      $scope.refresh = function() {
        loadNetworkInfo();
      };

      function loadNetworkInfo() {
        APIUtils.getNetworkInfo().then(function(data) {
          dataService.setNetworkInfo(data);
          $scope.network = data.formatted_data;
          $scope.hostname = data.hostname;
          $scope.defaultgateway = data.defaultgateway;
          if ($scope.network.interface_ids.length) {
            // Use the first network interface if the user hasn't choosen one
            if (!$scope.selectedInterface ||
                !$scope.network.interfaces[$scope.selectedInterface]) {
              $scope.selectedInterface = $scope.network.interface_ids[0];
            }
            $scope.interface =
                $scope.network.interfaces[$scope.selectedInterface];
            // Copy the interface so we know later if changes were made to the
            // page
            $scope.old_interface = JSON.parse(JSON.stringify($scope.interface));
          }
        });
      }
    }
  ]);

})(angular);
