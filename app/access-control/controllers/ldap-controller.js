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
      $scope.originalLdapProperties = {};
      $scope.submitted = false;
      $scope.roleGroups = [];
      $scope.roleGroupType = '';
      $scope.ldapCertExpiration = '';
      $scope.caCertExpiration = '';

      $scope.$on('$viewContentLoaded', function() {
        $scope.loadLdap();
      });

      $scope.loadLdap = function() {
        $scope.loading = true;
        $scope.submitted = false;
        const getLdapProperties = APIUtils.getAllUserAccountProperties().then(
            function(data) {
              const serviceEnabled = data.LDAP.ServiceEnabled || data.ActiveDirectory.ServiceEnabled;
              const ldapServiceEnabled = data.LDAP.ServiceEnabled;
              const adServiceEnabled = data.ActiveDirectory.ServiceEnabled;
              const enabledServiceType = setEnabledServiceType(data);
              const serviceAddresses = setServiceAddresses(data);
              const useSSL = setUseSSL(data);
              const userName = setUsername(data);
              const baseDistinguishedNames = setBaseDistinguishedNames(data);
              const groupsAttribute = setGroupsAttribute(data);
              const usernameAttribute = setUsernameAttribute(data);
              const authenticationType = setAuthenticationType(data);
              const roleGroups = setRoleGroups(data);


              return {
                'ServiceEnabled': serviceEnabled,
                'LDAPServiceEnabled': ldapServiceEnabled,
                'ADServiceEnabled': adServiceEnabled,
                'EnabledServiceType': enabledServiceType,
                'ServiceAddresses': serviceAddresses,
                'useSSL': useSSL,
                'Username': userName,
                'BaseDistinguishedNames': baseDistinguishedNames,
                'GroupsAttribute': groupsAttribute,
                'UsernameAttribute': usernameAttribute,
                'AuthenticationType': authenticationType,
                'RoleGroups': roleGroups
              };
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        const lDAPCertificate =
            getCertificate('/redfish/v1/AccountService/LDAP/Certificates');

        const caCertificate =
            getCertificate('/redfish/v1/Managers/bmc/Truststore/Certificates/');

        var promises = [getLdapProperties, lDAPCertificate, caCertificate];
        $q.all(promises).then(function(results) {
          $scope.ldapProperties = results[0];
          $scope.originalLdapProperties = angular.copy(results[0]);
          $scope.roleGroupType = results[0].EnabledServiceType;
          $scope.roleGroups = results[0].RoleGroups;
          $scope.ldapCertificate = results[1];
          $scope.caCertificate = results[2];
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
        const enabledServicePayload =
            createLdapEnableRequest(enabledServiceType, $scope.ldapProperties);
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
                    // The response returned a 200 but there was an error
                    // property sent in the response. It is unclear what
                    // settings were saved. Reloading LDAP to make it clear
                    // to the user.
                    toastService.error('Unable to update all LDAP settings.');
                    $scope.loadLdap();
                    console.log(response.data.error.message);
                  }
                },
                function(error) {
                  toastService.error('Unable to update LDAP settings.');
                  console.log(JSON.stringify(error));
                });
      };

      /**
       * Test if URI starts with ldaps
       * @param {string} uri
       */
      function isURISecure(uri) {
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
            $scope.originalLdapProperties.EnabledServiceType;

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
       *
       * @param {string} uri for certificate
       * @returns {null | Object}
       */
      function getCertificate(location) {
        return APIUtils.getCertificate(location).then(function(data) {
          if (data.Members && data.Members.length) {
            return APIUtils.getCertificate(data.Members[0]['@odata.id'])
                .then(
                    function(response) {
                      return response;
                    },
                    function(error) {
                      console.log(json.stringify(error));
                    })
          } else {
            return null;
          }
        });
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {string}
       */
      function setEnabledServiceType(ldapProperties) {
        let enabledServiceType = '';
        if (ldapProperties.LDAP.ServiceEnabled) {
          enabledServiceType = 'ldap';
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          enabledServiceType = 'ad';
        }
        return enabledServiceType;
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {Array}
       */
      function setServiceAddresses(ldapProperties) {
        let serviceAddresses = [];
        if (ldapProperties.LDAP.ServiceEnabled) {
          serviceAddresses = ldapProperties.LDAP.ServiceAddresses;
        } else if ( ldapProperties.ActiveDirectory.ServiceEnabled) {
          serviceAddresses = ldapProperties.ActiveDirectory.ServiceAddresses;
        }
        return serviceAddresses;
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {boolean}
       */
      function setUseSSL(ldapProperties) {
        let isSSL = false;
        if (ldapProperties.LDAP.ServiceEnabled) {
          isSSL = isURISecure(ldapProperties.LDAP.ServiceAddresses[0]);
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          isSSL = isURISecure(ldapProperties.ActiveDirectory.ServiceAddresses[0]);
        }
        return isSSL;
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {string}
       */
      function setUsername(ldapProperties) {
        let username = '';
        if (ldapProperties.LDAP.ServiceEnabled) {
          username =  ldapProperties.LDAP.Authentication.Username;
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          username = ldapProperties.ActiveDirectory.Authentication.Username;
        }
        return username;
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {Array}
       */
      function setBaseDistinguishedNames(ldapProperties) {
        let basedDisguishedNames = [];
        if (ldapProperties.LDAP.ServiceEnabled) {
          basedDisguishedNames =
              ldapProperties.LDAP.LDAPService.SearchSettings.BaseDistinguishedNames;
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          basedDisguishedNames = ldapProperties.ActiveDirectory.LDAPService.SearchSettings
                                     .BaseDistinguishedNames;
        }
        return basedDisguishedNames;
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {string}
       */
      function setGroupsAttribute(ldapProperties) {
        let groupsAttribute = '';
        if (ldapProperties.LDAP.ServiceEnabled) {
          groupsAttribute =  ldapProperties.LDAP.LDAPService.SearchSettings.GroupsAttribute;
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          groupsAttribute = ldapProperties.ActiveDirectory.LDAPService.SearchSettings
          .GroupsAttribute;
        }
        return groupsAttribute;
      }


      /**
     *
     * @param {Object} ldapProperties
     * @returns {string}
     */
      function setUsernameAttribute(ldapProperties) {
        let userNameAttribute = '';
        if (ldapProperties.LDAP.ServiceEnabled) {
          userNameAttribute = ldapProperties.LDAP.LDAPService.SearchSettings.UsernameAttribute;
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          userNameAttribute = ldapProperties.ActiveDirectory.LDAPService.SearchSettings
          .UsernameAttribute;
        }
        return userNameAttribute;
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {null | string}
       */
      function setAuthenticationType(ldapProperties) {
        let authenticationType = null;
        if (ldapProperties.LDAP.ServiceEnabled) {
          authenticationType = ldapProperties.LDAP.Authentication.AuthenticationType;
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          authenticationType = ldapProperties.ActiveDirectory.Authentication.AuthenticationType;
        }
        return authenticationType;
      }

      /**
       *
       * @param {Object} ldapProperties
       * @returns {Array} A list of role groups
       */
      function setRoleGroups(ldapProperties) {
        let roleGroups = [];
        if (ldapProperties.LDAP.ServiceEnabled) {
          roleGroups = ldapProperties.LDAP.RemoteRoleMapping;
        } else if (ldapProperties.ActiveDirectory.ServiceEnabled) {
          roleGroups =
          ldapProperties.ActiveDirectory.RemoteRoleMapping;
        }

        return roleGroups;
      }

      /**
       * Returns the payload needed to enable an LDAP Service
       * @param {string} serviceType - 'ldap' or 'ad'
       */
      function createLdapEnableRequest(serviceType, ldapProperties) {
        let ldapRequest = {};
        const ServiceEnabled = true;
        const Authentication = {
          Username: ldapProperties.Username,
          AuthenticationType: ldapProperties.AuthenticationType
        };
        const LDAPService = {
          SearchSettings: {
            BaseDistinguishedNames:
                ldapProperties.BaseDistinguishedNames,
            GroupsAttribute: ldapProperties.GroupsAttribute,
            UsernameAttribute: ldapProperties.UsernameAttribute
          }
        };
        const ServiceAddresses = ldapProperties.ServiceAddresses;

        if (serviceType == 'ldap') {
          ldapRequest = {
            LDAP: {
              ServiceEnabled,
              Authentication,
              LDAPService,
              ServiceAddresses
            }
          };
        } else {
          ldapRequest = {
            ActiveDirectory: {
              ServiceEnabled,
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
