/**
 * Controller for LDAP
 *
 * @module app/configuration
 * @exports ldapController
 * @name ldapController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('ldapController', [
    '$scope', 'APIUtils', '$q', 'toastService',
    function($scope, APIUtils, $q, toastService) {
      $scope.loading = false;
      $scope.isSecure = false;
      $scope.ldapProperties = {};
      $scope.wasOriginallyEnabled = false;
      $scope.originalProperties = {};
      $scope.submitted = false;
      $scope.clientCertificateExpires = '';

      $scope.loadLdap = function() {
        $scope.loading = true;
        $scope.submitted = false;
        var getLdapProperties = APIUtils.getAllUserAccountProperties().then(
            function(data) {
              $scope.ldapProperties = {
                'ServiceEnabled': data.LDAP.ServiceEnabled,
                'ServiceAddresses': data.LDAP.ServiceAddresses,
                'useSSL': $scope.isSSL(data.LDAP.ServiceAddresses[0]),
                'Username': data.LDAP.Authentication.Username,
                'BaseDistinguishedNames':
                    data.LDAP.LDAPService.SearchSettings.BaseDistinguishedNames,
                'GroupsAttribute':
                    data.LDAP.LDAPService.SearchSettings.GroupsAttribute,
                'UsernameAttribute':
                    data.LDAP.LDAPService.SearchSettings.UsernameAttribute,
                'AuthenticationType':
                    data.LDAP.Authentication.AuthenticationType
              };
              $scope.wasOriginallyEnabled = data.LDAP.ServiceEnabled;
              $scope.addUpdateChecks();
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        var getClientCertificate =
            APIUtils
                .getCertificate('/redfish/v1/AccountService/LDAP/Certificates')
                .then(
                    function(data) {
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
                                })
                      }
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                    });
        var promises = [getLdapProperties];

        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      };


      $scope.saveLdapSettings = function() {
        // If user chooses secure ldap using ssl, make sure addresse(s) start
        // with ldaps://
        for (var i in $scope.ldapProperties.ServiceAddresses) {
          if ($scope.ldapProperties.useSSL !==
              $scope.isSSL($scope.ldapProperties.ServiceAddresses[i])) {
            toastService.error(
                'Server URI ' + $scope.ldapProperties.ServiceAddresses[i] +
                ' must begin with ' +
                ($scope.ldapProperties.useSSL ? 'ldaps:// ' : 'ldap:// ') +
                'when SSL is ' +
                ($scope.ldapProperties.useSSL ? 'configured ' :
                                                'not configured'));
            return;
          } else if (!$scope.ldapProperties.ServiceAddresses[i].startsWith(
                         'ldap://')) {
            toastService.error('Server URI must start with ldap://');
            return;
          }
        }

        var LDAP = {};
        var SearchSettings = {};
        var Authentication = {};
        var data = {};
        Authentication.AuthenticationType =
            $scope.ldapProperties.AuthenticationType;

        if ($scope.ldapProperties.ServiceEnabledUpdated) {
          LDAP.ServiceEnabled = $scope.ldapProperties.ServiceEnabled;
        }
        if ($scope.ldapProperties.ServiceAddressesUpdated) {
          LDAP.ServiceAddresses = $scope.ldapProperties.ServiceAddresses;
        }
        if ($scope.ldapProperties.UsernameUpdated) {
          Authentication.Username = $scope.ldapProperties.Username;
        }
        if ($scope.ldapProperties.PasswordUpdated) {
          Authentication.Password = $scope.ldapProperties.Password;
        }
        if ($scope.ldapProperties.BaseDistinguishedNamesUpdated) {
          SearchSettings.BaseDistinguishedNames =
              $scope.ldapProperties.BaseDistinguishedNames;
        }
        if ($scope.ldapProperties.GroupsAttributeUpdated) {
          SearchSettings.GroupsAttribute =
              $scope.ldapProperties.GroupsAttribute;
        }
        if ($scope.ldapProperties.UsernameAttributeUpdated) {
          SearchSettings.UsernameAttribute =
              $scope.ldapProperties.UsernameAttribute;
        }

        LDAP.Authentication = Authentication;
        LDAP.LDAPService = {};
        LDAP.LDAPService.SearchSettings = SearchSettings;
        data.LDAP = LDAP;

        APIUtils.saveLdapProperties(data).then(
            function(response) {
              toastService.success('Successfully updated LDAP settings');
              $scope.loadLdap();
            },
            function(error) {
              toastService.error('Unable to update LDAP settings');
              console.log(JSON.stringify(error));
            });
      };

      $scope.isSSL = function(uri) {
        return uri.startsWith('ldaps://');
      };

      $scope.addUpdateChecks = function() {
        $scope.ldapProperties.ServiceEnabledUpdated = false;
        $scope.ldapProperties.ServiceAddressesUpdated = false;
        $scope.ldapProperties.UsernameUpdated = false;
        $scope.ldapProperties.BaseDistinguishedNamesUpdated = false;
        $scope.ldapProperties.GroupsAttributeUpdated = false;
        $scope.ldapProperties.UsernameAttributeUpdated = false;
        $scope.ldapProperties.PasswordUpdated = false;
      };

      $scope.loadLdap();
    }
  ]);
})(angular);
