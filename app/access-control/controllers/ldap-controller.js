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
        const getLdapProperties =
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
        const enabledServiceType = $scope.ldapProperties.EnabledServiceType;
        const enabledServicePayload = createLdapEnableRequest(enabledServiceType);
        const disabledServiceType =
            enabledServiceType == 'ldap' ? 'ad' : 'ldap';
        const disabledServicePayload =
            createLdapDisableRequest(disabledServiceType);

        APIUtils.saveLdapProperties(disabledServicePayload)
            .then(function(response) {
              return APIUtils.saveLdapProperties(enabledServicePayload);
            })
            .then(
                function(response) {
                  if (!response.data.hasOwnProperty('error')) {
                    toastService.success('Successfully updated LDAP settings.');
                    $scope.loadLdap();
                  } else {
                    toastService.error('Unable to update all LDAP settings.');
                    console.log(response.data.error.message);
                  }
                },
                function(error) {
                  toastService.error('Unable to update LDAP settings.');
                  console.log(JSON.stringify(error));
                });
      };

      $scope.isSSL = function(uri) {
        return uri.startsWith('ldaps://');
      };

      /**
       * Sends a request to disable the LDAP Service if the user
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

          const disabledServicePayload =
              createLdapDisableRequest(originalEnabledServiceType);
          APIUtils.saveLdapProperties(disabledServicePayload)
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
       * Returns the payload needed to enable an LDAP Service
       * @param {string} serviceType - 'ldap' or 'ad'
       */
      function createLdapEnableRequest(serviceType) {
        let ldapRequest = {};
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
          ldapRequest = {
            LDAP: {
              ServiceEnabled: true,
              Authentication,
              LDAPService,
              ServiceAddresses
            }
          };
        } else {
          ldapRequest = {
            ActiveDirectory: {
              ServiceEnabled: true,
              Authentication,
              LDAPService,
              ServiceAddresses
            }
          };
        }
        return ldapRequest;
      };

      /**
       * Returns the payload needed to disable an LDAP Service
       * @param {string} serviceType - 'ldap' or 'ad'
       */
      function createLdapDisableRequest(serviceType) {
        let ldapRequest = {};
        const ServiceEnabled = false;
        if (serviceType == 'ldap') {
          ldapRequest = {LDAP: {ServiceEnabled}};
        } else {
          ldapRequest = {ActiveDirectory: {ServiceEnabled}};
        }
        return ldapRequest;
      }
    }
  ]);
})(angular);
