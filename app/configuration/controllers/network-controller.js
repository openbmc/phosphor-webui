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

      $scope.addIpv4Field = function() {
        $scope.interface.ipv4.values.push(
            {Address: '', PrefixLength: '', Gateway: ''});
      };

      $scope.removeIpv4Address = function(index) {
        $scope.interface.ipv4.values.splice(index, 1);
      };

      $scope.addDNSField = function() {
        $scope.interface.Nameservers.push('');
      };

      $scope.removeDNSField = function(index) {
        $scope.interface.Nameservers.splice(index, 1);
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
                  ' invalid IP parameter. Your IPV4 settings were not saved.';
              $scope.loading = false;
              return;
            }
            // The netmask prefix length will be undefined if outside range
            else if (!$scope.interface.ipv4.values[i].PrefixLength) {
              $scope.set_network_error =
                  $scope.interface.ipv4.values[i].Address +
                  ' invalid Prefix Length parameter. Your IPV4 settings were not saved.';
              $scope.loading = false;
              return;
            }
          }
          // Combine list of existing IPV4 objects with list of their ids in
          // order to remove updated or removed IPV4 addresses by id
          var existingIPV4s = [];
          for (var i in $scope.old_interface.ipv4.values) {
            existingIPV4s.push({
              id: $scope.old_interface.ipv4.ids[i],
              Address: $scope.old_interface.ipv4.values[i].Address,
              Gateway: $scope.old_interface.ipv4.values[i].Gateway,
              PrefixLength: $scope.old_interface.ipv4.values[i].PrefixLength
            })
          }
          // The correct way to edit an IPV4 interface is to remove it and then
          // add a new one. Find the old IP4 values that do not exist (have
          // matching address, prefix length, and gateway) in the the new IPV4
          // list and remove by id. Find the new IPV4 values that do not exist
          // in the old IPV4 list and add.
          var toRemove = existingIPV4s.filter(function(existingIPV4) {
            return !$scope.interface.ipv4.values.some(function(newIPV4) {
              return existingIPV4.Address == newIPV4.Address &&
                  existingIPV4.PrefixLength == newIPV4.PrefixLength &&
                  existingIPV4.Gateway == newIPV4.Gateway;
            });
          });

          var toAdd = $scope.interface.ipv4.values.filter(function(newIPV4) {
            return !existingIPV4s.some(function(existingIPV4) {
              return newIPV4.Address == existingIPV4.Address &&
                  newIPV4.PrefixLength == existingIPV4.PrefixLength &&
                  newIPV4.Gateway == existingIPV4.Gateway;
            });
          });
          if (toRemove.length) {
            for (var i in toRemove) {
              promises.push(removeIPV4(toRemove[i].id, toRemove[i]));
            }
          }
          if (toAdd.length) {
            for (var j in toAdd) {
              promises.push(addIPV4(toAdd[j]));
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
        // strings above, could have an empty array. TODO: openbmc/openbmc#3240
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

      function removeIPV4(id, value) {
        return APIUtils.deleteIPV4($scope.selectedInterface, id)
            .catch(function(error) {
              console.log(JSON.stringify(error));
              $scope.set_network_error = value.Address;
            })
      }
      function addIPV4(value) {
        return APIUtils
            .addIPV4(
                $scope.selectedInterface, value.Address, value.PrefixLength,
                value.Gateway)
            .catch(function(error) {
              console.log(JSON.stringify(error));
              $scope.set_network_error = value.Address;
            })
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
            // Use the first network interface if the user hasn't chosen one
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
