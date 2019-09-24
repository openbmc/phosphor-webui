import { is } from "@uirouter/core";

/**
 * Controller for LDAP
 *
 * @module app/access-control
 * @exports ldapController
 * @name ldapController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.accessControl').controller('ldapController', [
    '$scope', 'APIUtils', '$q', 'toastService',
    function($scope, APIUtils, $q, toastService) {
      $scope.loading = false;
      $scope.isSecure = false;
      $scope.ldapProperties = {};
      $scope.originalProperties = {};
      $scope.submitted = false;
      $scope.roleGroups = [];
      $scope.roleGroupType = '';
      $scope.clientCertificateExpires = '';

      $scope.$on('$viewContentLoaded', function() {
        $scope.loadLdap();
      });

      $scope.loadLdap = function() {
        $scope.loading = true;
        $scope.submitted = false;
        let getLdapProperties =
            APIUtils.getAllUserAccountProperties()
                .then(function(data) {
                  $scope.ldapProperties = {
                    'ServiceEnabled': data.LDAP.ServiceEnabled ?
                        data.LDAP.ServiceEnabled :
                        data.ActiveDirectory.ServiceEnabled ?
                        data.ActiveDirectory.ServiceEnabled :
                        false,
                    'LDAPServiceEnabled': data.LDAP.ServiceEnabled,
                    'ADServiceEnabled': data.ActiveDirectory.ServiceEnabled,
                    'EnabledServiceType': data.LDAP.ServiceEnabled ?
                        'ldap' :
                        data.ActiveDirectory.ServiceEnabled ? 'ad' : '',
                    'ServiceAddresses': data.LDAP.ServiceEnabled ?
                        data.LDAP.ServiceAddresses :
                        data.ActiveDirectory.ServiceEnabled ?
                        data.ActiveDirectory.ServiceAddresses :
                        [],
                    'useSSL': $scope.isSSL(
                        data.LDAP.ServiceEnabled ?
                            data.LDAP.ServiceAddresses[0] :
                            data.ActiveDirectory.ServiceAddresses[0]),
                    'Username': data.LDAP.ServiceEnabled ?
                        data.LDAP.Authentication.Username :
                        data.ActiveDirectory.ServiceEnabled ?
                        data.ActiveDirectory.Authentication.Username :
                        '',
                    'BaseDistinguishedNames': data.LDAP.ServiceEnabled ?
                        data.LDAP.LDAPService.SearchSettings
                            .BaseDistinguishedNames :
                        data.ActiveDirectory.ServiceEnabled ?
                        data.ActiveDirectory.LDAPService.SearchSettings
                                .BaseDistinguishedNames :
                        [],
                    'GroupsAttribute': data.LDAP.ServiceEnabled ?
                        data.LDAP.LDAPService.SearchSettings.GroupsAttribute :
                        data.ActiveDirectory.ServiceEnabled ?
                        data.ActiveDirectory.LDAPService.SearchSettings
                                .GroupsAttribute :
                        '',
                    'UsernameAttribute': data.LDAP.ServiceEnabled ?
                        data.LDAP.LDAPService.SearchSettings.UsernameAttribute :
                        data.ActiveDirectory.ServiceEnabled ?
                        data.ActiveDirectory.LDAPService.SearchSettings
                                .UsernameAttribute :
                        '',
                    'AuthenticationType': data.LDAP.ServiceEnabled ?
                        data.LDAP.Authentication.AuthenticationType :
                        data.ActiveDirectory.Authentication.AuthenticationType,
                  };

                  $scope.roleGroupType =
                      $scope.ldapProperties.EnabledServiceType;

                  if ($scope.ldapProperties.ServiceEnabled) {
                    if ($scope.ldapProperties.LDAPServiceEnabled) {
                      $scope.roleGroups = data.LDAP.RemoteRoleMapping;
                    } else if ($scope.ldapProperties.ADServiceEnabled) {
                      $scope.roleGroups =
                          data.ActiveDirectory.RemoteRoleMapping;
                    }
                  }
                })
                .catch(function(error) {
                  console.log(JSON.stringify(error));
                });
        var getClientCertificate =
            APIUtils
                .getCertificate('/redfish/v1/AccountService/LDAP/Certificates')
                .then(function(data) {
                  if (data.Members) {
                    var certificate = data.Members[0];
                    APIUtils.getCertificate(certificate['@odata.id'])
                        .then(
                            function(data) {
                              $scope.clientCertificateExpires =
                                  data.ValidNotAfter;
                            },
                            function(error) {
                              console.log(JSON.stringify(error));
                            });
                  }
                })
                .catch(function(error) {
                  console.log(JSON.stringify(error));
                });

        var promises = [getLdapProperties, getClientCertificate];
        $q.all(promises).finally(function() {
          $scope.originalProperties = angular.copy($scope.ldapProperties);
          $scope.loading = false;
        });
      };

      /**
       * Save LDAP settings
       * Will be making two calls every time to accomodate the backend design
       * LDAP and ActiveDirectory changes can not be sent together when changing
       * from AD to LDAP
       */
      $scope.saveLdapSettings = function() {
        // Test if we need to send multiple requests. If we are changing the
        // service type, we need to send the first request to disable and reset
        // the existing service and then enable and send the properies for the
        // new service
        const originalEnabledServiceType =
            $scope.originalProperties.EnabledServiceType;
        const newEnabledServiceType = $scope.ldapProperties.EnabledServiceType;

        if (originalEnabledServiceType &&
            originalEnabledServiceType !== newEnabledServiceType) {
          const originalEnabledServiceTypePayload =
              getLdapRequest(originalEnabledServiceType, false);

              APIUtils.saveLdapProperties(originalEnabledServiceTypePayload)
              .then(
                  function(response) {
                    if (!response.data.hasOwnProperty('error')) {
                      const requestPayload =
                          getLdapRequest(newEnabledServiceType, true);
                      callSaveLdapProperties(requestPayload);
                    } else {
                      toastService.error('Unable to update all LDAP settings.');
                      console.log(JSON.stringify(response.data.error.message));
                    }
                  },
                  function(error) {
                    toastService.error('Unable to disable LDAP.');
                    console.log(JSON.stringify(error));
                  });
        } else {
          const requestPayload = getLdapRequest(
              $scope.ldapProperties.EnabledServiceType, true);
          callSaveLdapProperties(requestPayload);
        }
      };

      $scope.isSSL = function(uri) {
        return uri.startsWith('ldaps://');
      };

      /**
       * Sends a reqeust to disable the LDAP Service if the user
       * toggled the service enabled checkbox in the UI and if
       * there was a previously saved service type. This prevents
       * unnecessary calls to the backend if the user toggled
       * the service enabled, but never actually had saved settings.
       */
      $scope.updateServiceEnabled = () => {
        const originalEnabledServiceType =
            $scope.originalProperties.EnabledServiceType;

        if (!$scope.ldapProperties.ServiceEnabled &&
            originalEnabledServiceType) {
          $scope.ldapProperties.EnabledServiceType = '';

          const requestPayload =
              getLdapRequest(originalEnabledServiceType, false);
          APIUtils.saveLdapProperties(requestPayload)
              .then(
                  function(response) {
                    toastService.success('Successfully disabled LDAP.');
                    $scope.roleGroups = [];
                    $scope.loadLdap();
                  },
                  function(error) {
                    toastService.error('Unable to update LDAP settings.');
                    console.log(JSON.stringify(error));
                  });
        }
      };

      /**
       * Create the object to send as the payload in the LDAP API call
       * @param {string} serviceType - 'ldap' or 'ad'
       * @param {boolean} serviceEnabled
       */
      function getLdapRequest(serviceType, serviceEnabled) {
        let ldapProperties = {};

        // If ServiceEnabled send the full LDAP or AD object
        // If not enabled, we can only send the ServiceEnabled
        // property in the LDAP or ActiveDirectory objects or
        // the request will fail
        if (serviceEnabled) {
          const Authentication = {
            Username: $scope.ldapProperties.Password,
            AuthenticationType: $scope.ldapProperties.AuthenticationType
          };

          const LDAPService = {
            SearchSettings: {
              BaseDistinguishedNames:
                  $scope.ldapProperties.BaseDistinguishedNames,
              GroupsAttribute: $scope.ldapProperties.GroupsAttribute,
              UsernameAttribute: $scope.ldapProperties.UsernameAttribute
            }
          };

          const ServiceAddresses = $scope.ldapProperties.ServiceAddresses;

          if (serviceType == 'ldap') {
            ldapProperties = {
              LDAP: {
                ServiceEnabled: serviceEnabled,
                Authentication,
                LDAPService,
                ServiceAddresses
              }
            };
          } else {
            ldapProperties = {
              ActiveDirectory: {
                ServiceEnabled: serviceEnabled,
                Authentication,
                LDAPService,
                ServiceAddresses
              }
            };
          }
        } else {
          if (serviceType == 'ldap') {
            ldapProperties = {
              LDAP: {
                ServiceEnabled: serviceEnabled
              }
            };
          } else {
            ldapProperties = {
              ActiveDirectory: {
                ServiceEnabled: serviceEnabled
              }
            };
          }
        }

        return ldapProperties;
      };

      /**
       * Calls saveLdapProperties service
       * @param {Object} data
       * @description Used to keep then callback DRY
       */
      function callSaveLdapProperties(data) {
        APIUtils.saveLdapProperties(data).then(
            (response) => {
              if (!response.data.hasOwnProperty('error')) {
                toastService.success('Successfully updated LDAP settings.');
                $scope.loadLdap();
              } else {
                toastService.error('Unable to update all LDAP settings.');
                console.log(response.data.error.message);
              }
            },
            (error) => {
              toastService.error('Unable to update LDAP settings.');
              console.log(JSON.stringify(error));
            });
      };
    }
  ]);
})(angular);
