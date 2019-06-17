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


      $scope.loadLdap = function() {
        $scope.loading = true;
        $scope.submitted = false;
        var getLdapProperties = APIUtils.getAllUserAccountProperties().then(
            function(data) {
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

              $scope.roleGroupType = $scope.ldapProperties.EnabledServiceType;

              if ($scope.ldapProperties.ServiceEnabled) {
                if ($scope.ldapProperties.LDAPServiceEnabled) {
                  $scope.roleGroups = data.LDAP.RemoteRoleMapping;
                } else if ($scope.ldapProperties.ADServiceEnabled) {
                  $scope.roleGroups = data.ActiveDirectory.RemoteRoleMapping;
                }
              }
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

        var promises = [getLdapProperties, getClientCertificate];
        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      };

      $scope.saveLdapSettings = function() {
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
          }
        }

        // Default LDAP and AD Attributes
        let LDAP = {};

        let ActiveDirectory = {};

        // Data to pass to request
        let data = {};
        data.LDAP = LDAP;
        data.ActiveDirectory = ActiveDirectory;

        // Values to update the service type object
        let Authentication = {};
        Authentication.Username = $scope.ldapProperties.Username;
        Authentication.Password = $scope.ldapProperties.Password;
        Authentication.AuthenticationType =
            $scope.ldapProperties.AuthenticationType;

        let LDAPService = {};
        LDAPService.SearchSettings = {};
        LDAPService.SearchSettings.BaseDistinguishedNames =
            $scope.ldapProperties.BaseDistinguishedNames;
        LDAPService.SearchSettings.GroupsAttribute =
            $scope.ldapProperties.GroupsAttribute;
        LDAPService.SearchSettings.UsernameAttribute =
            $scope.ldapProperties.UsernameAttribute;

        let ServiceAddresses = $scope.ldapProperties.ServiceAddresses;
        if ($scope.ldapProperties.EnabledServiceType == 'ldap') {
          ActiveDirectory.ServiceEnabled = false;
          LDAP.ServiceEnabled = true;
          LDAP.Authentication = Authentication;
          LDAP.LDAPService = LDAPService;
          LDAP.ServiceAddresses = ServiceAddresses;
        } else if ($scope.ldapProperties.EnabledServiceType == 'ad') {
          ActiveDirectory.ServiceEnabled = true;
          LDAP.ServiceEnabled = false;
          ActiveDirectory.Authentication = Authentication;
          ActiveDirectory.LDAPService = LDAPService;
          ActiveDirectory.ServiceAddresses = ServiceAddresses;
        }

        APIUtils.saveLdapProperties(data).then(
            function(response) {
              if (!response.data.hasOwnProperty('error')) {
                toastService.success('Successfully updated LDAP settings');
                $scope.loadLdap();
              } else {
                toastService.error('Unable to update LDAP settings');
                console.log(JSON.stringify(response.data.error.message));
              }
            },
            function(error) {
              toastService.error('Unable to update LDAP settings');
              console.log(JSON.stringify(error));
            });
      };

      $scope.isSSL = function(uri) {
        return uri.startsWith('ldaps://');
      };
      $scope.updateServiceEnabled =
          function() {
        if (!$scope.ldapProperties.ServiceEnabled) {
          $scope.ldapProperties.EnabledServiceType = '';
          let data = {};
          let LDAP = {};
          data.LDAP = LDAP;
          LDAP.ServiceEnabled = false;
          let ActiveDirectory = {};
          data.ActiveDirectory = ActiveDirectory;
          ActiveDirectory.ServiceEnabled = false;

          APIUtils.saveLdapProperties(data).then(
              function(response) {
                toastService.success('Successfully disabled LDAP');
                $scope.roleGroups = [];
                $scope.loadLdap();
              },
              function(error) {
                toastService.error('Unable to disable LDAP');
                console.log(JSON.stringify(error));
              });
        }
      }

          $scope.loadLdap();
    }
  ]);
})(angular);
