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
      $scope.setNetworkError = '';
      $scope.setNetworkSuccess = false;
      $scope.confirmSettings = false;
      $scope.loading = false;
      $scope.ipv4sToDelete = [];
      $scope.netIntfFullData = [];
      $scope.selectedIntfIdx = 0;
      $scope.selectedIntf = {};
      $scope.showIntfDropdown = false;

      loadNetworkInfo();

      $scope.selectInterface = function(index) {
        $scope.selectedIntfIdx = index;
        $scope.selectedIntf = angular.copy($scope.netIntfFullData[index]);
        $scope.showIntfDropdown = false;
      };

      $scope.addDNSField = function() {
        $scope.selectedIntf.NameServers.push('');
      };

      $scope.removeDNSField = function(index) {
        $scope.selectedIntf.NameServers.splice(index, 1);
      };

      $scope.addIPv4Field = function() {
        $scope.selectedIntf.IPv4Addresses.push(
            {Address: '', PrefixLength: '', Gateway: ''});
      };

      $scope.removeIPv4Address = function(index) {
        // Check if the IPV4 being removed has an id. This indicates that it is
        // an existing address and needs to be removed in the back end.
        if ($scope.selectedIntf.IPv4Addresses[index].id) {
          $scope.ipv4sToDelete.push($scope.selectedIntf.IPv4Addresses[index]);
        }
        $scope.selectedIntf.IPv4Addresses.splice(index, 1);
      };

      $scope.setNetworkSettings = function() {
        // Hides the confirm network settings modal
        $scope.confirmSettings = false;
        $scope.setNetworkError = '';
        $scope.setNetworkSuccess = false;
        $scope.loading = true;
        var intfIdx = $scope.selectedIntfIdx;
        var promises = [];

        // MAC Address are case-insensitive
        if ($scope.selectedIntf.MACAddress.toLowerCase() !=
            $scope.netIntfFullData[intfIdx].MACAddress.toLowerCase()) {
          promises.push(setMACAddress());
        }
        if ($scope.selectedIntf.DefaultGateway !=
            $scope.netIntfFullData[intfIdx].DefaultGateway) {
          promises.push(setDefaultGateway());
        }
        if ($scope.selectedIntf.HostName !=
            $scope.netIntfFullData[intfIdx].HostName) {
          promises.push(setHostname());
        }
        if ($scope.selectedIntf.DHCPv4.DHCPEnabled !=
            $scope.netIntfFullData[intfIdx].DHCPv4.DHCPEnabled) {
          promises.push(setDHCPEnabled());
        }

        // Remove any empty strings from the array. Important because we add an
        // empty string to the end so the user can add a new DNS server, if the
        // user doesn't fill out the field, we don't want to add.
        $scope.selectedIntf.NameServers =
            $scope.selectedIntf.NameServers.filter(Boolean);
        // toString() is a cheap way to compare 2 string arrays
        if ($scope.selectedIntf.NameServers.toString() !=
            $scope.netIntfFullData[intfIdx].NameServers.toString()) {
          promises.push(setNameservers());
        }

        // Set IPV4 IP Addresses, Netmask Prefix Lengths, and Gateways
        console.log($scope.selectedIntf.DHCPv4.DHCPEnabled);
        if (!$scope.selectedIntf.DHCPv4.DHCPEnabled) {
          // Delete existing IPV4 addresses that were removed
          promises.push(removeIPV4s());
          // Update any changed IPV4 addresses and add new
          for (var i in $scope.selectedIntf.IPv4Addresses) {
            /*
               if(($scope.selectedIntf.IPv4Addresses[i].Address ==
               $scope.netIntfFullData[intfIdx].IPv4Addresses[i].Address)
               &&
                           ($scope.selectedIntf.IPv4Addresses[i].Gateway ==
               $scope.netIntfFullData[intfIdx].IPv4Addresses[i].Gateway)
               &&
                           ($scope.selectedIntf.IPv4Addresses[i].PrefixLength ==
               $scope.netIntfFullData[intfIdx].IPv4Addresses[i].PrefixLength))
                        {
                          console.log("No change in IPv4 Settings");
                          continue;
                        }
            */
            if (!APIUtils.validIPV4IP(
                    $scope.selectedIntf.IPv4Addresses[i].Address)) {
              $scope.setNetworkError =
                  $scope.selectedIntf.IPv4Addresses[i].Address +
                  ' invalid IP parameter';
              $scope.loading = false;
              return;
            }
            if (!APIUtils.validIPV4IP(
                    $scope.selectedIntf.IPv4Addresses[i].Gateway)) {
              $scope.setNetworkError =
                  $scope.selectedIntf.IPv4Addresses[i].Address +
                  ' invalid gateway parameter';
              $scope.loading = false;
              return;
            }
            // The netmask prefix length will be undefined if outside range
            if (!$scope.selectedIntf.IPv4Addresses[i].PrefixLength) {
              $scope.setNetworkError =
                  $scope.selectedIntf.IPv4Addresses[i].Address +
                  ' invalid Prefix Length parameter';
              $scope.loading = false;
              return;
            }
            // If IPV4 has an id it means it already exists in the back end,
            // and in order to update it is required to remove previous IPV4
            // address and add new one. See openbmc/openbmc/issues/2163.
            // TODO: update to use PUT once issue 2163 is resolved.
            if ($scope.selectedIntf.IPv4Addresses[i].ipAddrId) {
              promises.push(updateIPV4(i));
            } else {
              promises.push(addIPV4(i));
            }
          }
        }

        if (promises.length) {
          $q.all(promises).finally(function() {
            $scope.loading = false;
            if (!$scope.setNetworkError) {
              $scope.setNetworkSuccess = true;
              // Since an IPV4 interface (e.g. IP address, gateway, or netmask)
              // edit is a delete then an add and the GUI can't calculate the
              // interface id (e.g. 5c083707) beforehand and it is not returned
              // by the REST call, openbmc#3227, reload the page after an edit,
              // which makes a 2nd REST call.
              // Do this for all network changes due to the possibility of a set
              // network failing even though it returned success, openbmc#1641,
              // and to update dataService and oldInterface to know which
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
                $scope.selectedIntf.Id, $scope.selectedIntf.MACAddress)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.setNetworkError = 'MAC Address';
                });
      }

      function setDefaultGateway() {
        return APIUtils.setDefaultGateway($scope.selectedIntf.DefaultGateway)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.setNetworkError = 'Default Gateway';
                });
      }

      function setHostname() {
        return APIUtils.setHostname($scope.selectedIntf.HostName)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.setNetworkError = 'HostName';
                });
      }

      function setDHCPEnabled() {
        return APIUtils
            .setDHCPEnabled(
                $scope.selectedIntf.Id, $scope.selectedIntf.DHCPv4.DHCPEnabled)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.setNetworkError = 'DHCP';
                });
      }

      function setNameservers() {
        // Nameservers does not allow an empty array, since we remove all empty
        // strings above, could have an empty array. TODO: openbmc/openbmc#3240
        if ($scope.selectedIntf.NameServers.length == 0) {
          $scope.selectedIntf.NameServers.push('');
        }
        return APIUtils
            .setNameservers(
                $scope.selectedIntf.Id, $scope.selectedIntf.NameServers)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.setNetworkError = 'DNS Servers';
                });
      }

      function removeIPV4s() {
        return $scope.ipv4sToDelete.map(function(ipv4) {
          return APIUtils.deleteIPV4($scope.selectedIntf.Id, ipv4.ipAddrId)
              .then(
                  function(data) {},
                  function(error) {
                    console.log(JSON.stringify(error));
                    $scope.setNetworkError = ipv4.Address;
                  })
        });
      }

      function addIPV4(index) {
        return APIUtils
            .addIPV4(
                $scope.selectedIntf.Id,
                $scope.selectedIntf.IPv4Addresses[index].Address,
                $scope.selectedIntf.IPv4Addresses[index].PrefixLength,
                $scope.selectedIntf.IPv4Addresses[index].Gateway)
            .then(
                function(data) {},
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.setNetworkError =
                      $scope.selectedIntf.IPv4Addresses[index].Address;
                })
      }

      function updateIPV4(index) {
        // The correct way to edit an IPV4 interface is to remove it and then
        // add a new one
        return APIUtils
            .deleteIPV4(
                $scope.selectedIntf.Id,
                $scope.selectedIntf.IPv4Addresses[index].ipAddrId)
            .then(
                function(data) {
                  return APIUtils
                      .addIPV4(
                          $scope.selectedIntf.Id,
                          $scope.selectedIntf.IPv4Addresses[index].Address,
                          $scope.selectedIntf.IPv4Addresses[index].PrefixLength,
                          $scope.selectedIntf.IPv4Addresses[index].Gateway)
                      .then(
                          function(data) {},
                          function(error) {
                            console.log(JSON.stringify(error));
                            $scope.setNetworkError =
                                $scope.selectedIntf.IPv4Addresses[index]
                                    .Address;
                          });
                },
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.setNetworkError =
                      $scope.selectedIntf.IPv4Addresses[index].Address;
                });
      }

      $scope.refresh = function() {
        loadNetworkInfo();
      };

      function loadNetworkInfo() {
        APIUtils.getBMCNetworkInfo()
            .then(
                function(res) {
                  $scope.netIntfFullData = res;
                  $scope.selectInterface(0);
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.loading = false;
            });
      };
    }
  ]);
})(angular);
