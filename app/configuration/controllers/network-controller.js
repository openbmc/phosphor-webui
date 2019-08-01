/**
 * Controller for network
 *
 * @module app/configuration
 * @exports networkController
 * @name networkController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration')
      .controller(
          'networkController',
          [
            '$scope', '$window', 'APIUtils', 'dataService', '$timeout',
            '$route', '$q', 'toastService', '$uibModal',
            function(
                $scope, $window, APIUtils, dataService, $timeout, $route, $q,
                toastService, $uibModal) {
              $scope.dataService = dataService;
              $scope.networkDevice = false;
              $scope.confirmSettings = false;
              $scope.loading = false;
              $scope.networkInterfaceOptions = {};
              $scope.originalNetworkInterfaceOptions = {};
              $scope.selectedInterface = {};
              $scope.selectedIpv4ConfigAddresses = [];
              $scope.deletedIPv4Indices = [];
              $scope.responseArr = [];

              $scope.callCount = 0;


              $scope.$on('$viewContentLoaded', () => {
                loadNetworkInterfaceOptions();
              })

              // Resetting the form to original state
              $scope.resetNetworkForm = function() {
                $scope.selectedInterface.fqdn =
                    $scope.originalNetworkInterfaceOptions.fqdn;
                $scope.selectedInterface.dhcpEnabled =
                    $scope.originalNetworkInterfaceOptions.dhcpEnabled;
                $scope.selectedInterface.hostname =
                    $scope.originalNetworkInterfaceOptions.hostname;
                $scope.selectedInterface.static =
                    $scope.originalNetworkInterfaceOptions.static.concat();
                $scope.selectedInterface.nameServers =
                    $scope.originalNetworkInterfaceOptions.nameServers.concat();
                $scope.selectedInterface.defaultGateway =
                    $scope.originalNetworkInterfaceOptions.defaultGateway;
              };


              $scope.addDNSField = function(index) {
                $scope.selectedInterface.nameServers.push('');
              };

              $scope.removeDNSField = function(index) {
                $scope.selectedInterface.nameServers.splice(index, 1);
              };

              $scope.addIpv4Field = function() {
                $scope.selectedInterface.static.push({
                  Address: '',
                  AddressOrigin: 'Static',
                  Gateway: $scope.selectedInterface.defaultGateway,
                  SubnetMask: ''
                });
              };

              $scope.removeIpv4Address = function(index) {
                $scope.selectedInterface.static.splice(index, 1);
                $scope.deletedIPv4Indices.push(index);
              };

              // updates the settings that have been changed
              function setNetworkSettings() {
                var pendingPromises = [];
                // check if ipv4 configuration has been changed
                // if ($scope.networkFormGeneral.ipConfig1.$dirty ||
                //     $scope.networkFormGeneral.ipConfig2.$dirty) {
                //   pendingPromises.push(setDHCPEnabled());
                // }

                // check if default gateway has been touched
                if ($scope.networkFormGeneral.ipDefaultGateway.$dirty) {
                  pendingPromises.push(setDefaultGateway());
                }

                // check if fqdn has been touched
                if ($scope.networkFormGeneral.fqdn.$dirty) {
                  pendingPromises.push(setFQDN())
                }
                // set dns servers
                if ($scope.networkFormDNS.$dirty) {
                  console.log('dns server getting hit successfully?');
                  pendingPromises.push(setDNSServers());
                };

                // set ipv4s
                if ($scope.networkFormIpv4.$dirty) {
                  const controls = $scope.networkFormIpv4.$getControls();
                  const valid = controls.filter((control) => control.$valid);
                  const data = valid.reduce((acc, control) => {
                    const controlPristine =
                        (control.addressOrigin.$pristine &&
                         control.ipv4SubnetMask.$pristine);
                    if (controlPristine) {
                      acc.push({});
                      return acc;
                    }


                    const address = {};
                    address.Address = control.ipv4Address.$modelValue;
                    address.SubnetMask = control.ipv4SubnetMask.$modelValue;
                    address.Gateway = '0.0.0.0';
                    acc.push(address);

                    return acc;
                  }, []);

                  // checks if any idices have been deleted
                  if ($scope.deletedIPv4Indices.length !== 0) {
                    for (let i = 0; i < $scope.deletedIPv4Indices.length; i++) {
                      data.splice($scope.deletedIPv4Indices[i], 0, null);
                    }
                  }
                  pendingPromises.push(setIpv4(data));
                };


                $q.all(pendingPromises)
                    .then(function(response) {

                    })
                    .catch(function(error) {
                      console.log(error);
                    })
                    .finally(function() {
                      const success = pendingPromises.filter(
                          response =>
                              response.$$state['value']['status'] == 200);

                      const failure = pendingPromises.filter(
                          response =>
                              response.$$state['value']['status'] == 400);


                      if (success.length > 0 && failure.length > 0) {
                        toastService.error('Partial success');
                      }

                      // TODO: Are we going to edit the toast service so it has
                      // a partial save toast?
                      if (success.length > 0 && failure.length == 0) {
                        toastService.success('Successfully saved settings');
                      }

                      if (failure.length > 0 && success.length == 0) {
                        toastService.error('Settings were not saved.');
                      }
                    })
              };

              $scope.displaySettingsModal = function() {
                initNetworkSettingsModal();
              };

              /**
               * Initiate account settings modal
               */
              function initNetworkSettingsModal() {
                const template = require('./network-modal-settings.html');
                $uibModal
                    .open({
                      template,
                      windowTopClass: 'uib-modal',
                      ariaLabelledBy: 'dialog_label',
                      controllerAs: 'modalCtrl',
                      controller: function() {}
                    })
                    .result
                    .then(() => {
                      // reference networkForm
                      if ($scope.networkFormGeneral.$valid &&
                          $scope.networkFormDNS.$valid &&
                          $scope.networkFormIpv4.$valid) {
                        console.log('is the then block getting hit');
                        setNetworkSettings()
                      }
                    })
                    .catch(
                        () => {
                            // do nothing
                        })
              };

              $scope.onConfigChange = function() {
                if ($scope.selectedInterface.dhcpEnabled) {
                  $scope.selectedIpv4ConfigAddresses =
                      $scope.selectedInterface.dhcpIpv4Addresses;
                  $scope.selectedInterface.nameServers =
                      $scope.originalNetworkInterfaceOptions.nameServers
                          .concat();
                  $scope.selectedInterface.static =
                      $scope.originalNetworkInterfaceOptions.static.concat();

                } else if (!$scope.selectedInterface.dhcpEnabled) {
                  $scope.selectedIpv4ConfigAddresses =
                      $scope.selectedInterface.staticIpv4Addresses;
                }
              };


              function setFQDN() {
                const deferred = $q.defer();
                APIUtils.setFQDNRedfish($scope.selectedInterface.fqdn)
                    .then(function(response) {
                      deferred.resolve(response);
                      console.log('response: ', response);
                    }),
                    function(error) {
                      deferred.reject(error);
                    };

                return deferred.promise;
              };


              function setDNSServers() {
                const deferred = $q.defer();
                // TODO: Hardcoding eth0 as network interface
                // This will need to be updated when we support
                // other network interfaces
                APIUtils
                    .editDnsServer('eth0', $scope.selectedInterface.nameServers)
                    .then(function(response) {
                      deferred.resolve(response);
                      console.log('response: ', response);
                    }),
                    function(error) {
                      deferred.reject(error);
                    };

                return deferred.promise;
              };

              function setDHCPEnabled() {
                const deferred = $q.defer();
                // TODO: Hardcoding eth0 as network interface
                // This will need to be updated when we support
                // other network interfaces
                APIUtils
                    .setIPv4ConfigRedfish('eth0', $scope.interface.DHCPEnabled)
                    .then(
                        function(response) {
                          deferred.resolve(response);
                        },
                        function(error) {
                          deferred.resolve(error);
                        });
                return deferred.promise;
              };

              function setDefaultGateway() {
                const deferred = $q.defer();
                // find index of the default gateway
                var index;
                for (let i = 0; i < $scope.interface.ipv4Redfish; i++) {
                  if ($scope.oldInterface.defaultGateway ==
                      $scope.interface.ipv4Redfish[i].Gateway) {
                    index = i;
                  }
                }
                // TODO: Hardcoding eth0 as network interface
                // This will need to be updated when we support
                // other network interfaces

                APIUtils
                    .setDefaultGatewayRedfish(
                        'eth0', $scope.interface.defaultGateway, index)
                    .then(
                        function(response) {
                          deferred.resolve(response);
                        },
                        function(error) {
                          deferred.reject(error);
                        })

                return deferred.promise;
              };

              function setIpv4(staticIpv4s) {
                const deferred = $q.defer();
                // TODO: Hardcoding eth0 as network interface
                // This will need to be updated when we support
                // other network interfaces
                APIUtils.editIpv4('eth0', staticIpv4s)
                    .then(
                        function(response) {
                          deferred.resolve(response);
                        },
                        function(error) {
                          deferred.reject(error);
                        })

                return deferred.promise;
              }

              // this function needs to get updated if we get more network
              // interface, and we do not want to display sit0
              function loadNetworkInterfaceOptions() {
                APIUtils.getNetworkInterfaceOptions().then(function(data) {
                  // TODO: Hardcoding eth0 as network interface
                  // This will need to be updated when we support
                  // other network interfaces
                  $scope.networkInterfaceOptions.eth0 = data[0];
                  loadNetworkInfoFromRedfish('eth0');
                });
              };

              function changeDNSIPv4() {
                APIUtils.getNetworkInfoRedfish($scope.selectedInterface)
                    .then(function(data) {
                      dataService.setNetworkInfo(data);
                      // only show ipv4s that are set to DHCP or LinkLocal
                      // if DHCP config is set

                      var dhcpIpv4Instances = data.ipv4.filter(
                          ipv4 => ipv4.AddressOrigin !== 'Static');
                      var staticIpv4Instances = data.ipv4.filter(
                          ipv4 =>
                              (ipv4.AddressOrigin == 'Static' ||
                               ipv4.AddressOrigin == 'IPv4LinkLocal'));
                      $scope.interface.Nameservers =
                          $scope.interface.DHCPEnabled ? data.nameServers :
                                                         data.staticNameServers;
                      // if dhcp is enabled show all ipv4 instances, if
                      // static is enabled only show ipv4 static instances
                      $scope.interface.ipv4Redfish =
                          $scope.interface.DHCPEnabled == true ?
                          dhcpIpv4Instances :
                          staticIpv4Instances;
                    })
              }

              /**
               * Get default gateway
               * @param {*} ipv4Addresses : array of ipv4 addresses
               * @returns {string} : default gateway
               */
              function getDefaultGateway(ipv4Addresses) {
                const potentialDefaultGateways =
                    ipv4Addresses.filter(ipv4 => ipv4.Gateway !== '0.0.0.0');

                const defaultGateway = potentialDefaultGateways ?
                    potentialDefaultGateways[potentialDefaultGateways.length - 1] :
                    '';

                return defaultGateway ? defaultGateway.Gateway : '0.0.0.0';
              }

              function getStaticIpv4s(data = [], isStatic = 'Static') {
                const prop = isStatic ? 'Static' : 'IPv4LinkLocal';
                var filteredData =
                    data.filter(ipv4 => (ipv4.AddressOrigin == prop));
                return filteredData;
              };

              function getDHCPIpv4s(ipv4Addresses) {
                const dhcpIpv4s = ipv4Addresses ?
                    ipv4Addresses.filter(
                        ipv4 =>
                            (ipv4.AddressOrigin == 'DHCP' ||
                             ipv4.AddressOrigin == 'IPv4LinkLocal')) :
                    [];
                return dhcpIpv4s;
              };

              function getFQDN() {
                return APIUtils.getFQDNRedfish().then(function(data) {
                  $scope.selectedInterface.fqdn = data;

                  $scope.originalNetworkInterfaceOptions.fqdn = data;
                })
              };

              function getNetworkInfo(networkInterface) {
                return APIUtils.getNetworkInfoRedfish(networkInterface)
                    .then(function(data) {
                      $scope.selectedInterface.dhcpEnabled = data.dhcpEnabled;
                      $scope.selectedInterface.hostname = data.hostname;
                      $scope.selectedInterface.linkLocal =
                          getStaticIpv4s(data.ipv4Addresses, false);
                      $scope.selectedInterface.static =
                          getStaticIpv4s(data.ipv4Addresses, true);
                      $scope.selectedInterface.dhcpIpv4Addresses =
                          getDHCPIpv4s(data.ipv4Addresses);
                      $scope.selectedIpv4ConfigAddresses = data.dhcpEnabled ?
                          $scope.selectedInterface.dhcpIpv4Addresses :
                          $scope.selectedInterface.staticIpv4Addresses;
                      $scope.selectedInterface.macAddress = data.macAddress;
                      $scope.selectedInterface.nameServers = data.nameServers;
                      $scope.selectedInterface.staticNameServers =
                          data.staticNameServers;
                      $scope.selectedInterface.defaultGateway =
                          getDefaultGateway(data.ipv4Addresses);
                      $scope.selectedInterface.staticIpv4Addresses =
                          data.ipv4StaticAddresses;



                      // save to old state
                      $scope.originalNetworkInterfaceOptions.dhcpEnabled =
                          $scope.selectedInterface.dhcpEnabled;
                      $scope.originalNetworkInterfaceOptions.hostname =
                          $scope.selectedInterface.hostname;
                      $scope.originalNetworkInterfaceOptions.nameServers =
                          $scope.selectedInterface.nameServers.concat();
                      $scope.originalNetworkInterfaceOptions.defaultGateway =
                          $scope.selectedInterface.defaultGateway;

                      $scope.originalNetworkInterfaceOptions.static =
                          $scope.selectedInterface.static.concat();
                    })
              }

              function loadNetworkInfoFromRedfish(selectedInterface) {
                const requests = [getFQDN(), getNetworkInfo(selectedInterface)];
                $q.all(requests).then((response) => {});
              }
            }
          ]),
      function(error) {};
})(angular);
