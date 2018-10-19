/**
 * Controller for date-time
 *
 * @module app/configuration
 * @exports dateTimeController
 * @name dateTimeController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('ldapController', [
    '$scope', '$window', 'APIUtils', '$route', '$q', 'Constants',
    function($scope, $window, APIUtils, $route, $q, Constants) {
      $scope.loading = true;
      $scope.searchScopes = ['sub', 'one', 'base'];
      $scope.ldapTypes = ['Active Directory', 'OpenLDAP'];
      $scope.ldapConfig = {};
      $scope.ldapDisabled = true;
      $scope.error = false;
      $scope.success = false;

      var getLdapConfiguration = APIUtils.getLdapConfiguration().then(
          function(data) {
            if (data) {
              $scope.ldapConfig = {
                ldapCurrentlyEnabled: true,
                serverUri: data.LDAPServerURI,
                secureLdap: data.SecureLDAP,
                bindDnPassword: '',
                baseDn: data.LDAPBaseDN,
                bindDn: data.LDAPBindDN,
                searchScope: Constants.LDAP_DISPLAY_MAP[data.LDAPSearchScope],
                ldapType: Constants.LDAP_DISPLAY_MAP[data.LDAPType]
              };
              $scope.ldapDisabled = false;
            }
          },
          function(error) {
            console.log(JSON.stringify(error));
          });

      getLdapConfiguration.finally(function() {
        $scope.loading = false;
      });

      $scope.saveLdapSettings = function() {
        $scope.loading = true;
        if ($scope.ldapDisabled === true) {
          if ($scope.ldapConfig.ldapCurrentlyEnabled !== true) {
            $scope.error = true;
            $scope.userMessage = 'LDAP is already disabled';
            $scope.loading = false;
            return;
          }
          APIUtils.deleteObject('/xyz/openbmc_project/user/ldap/config')
              .then(
                  function(data) {
                    $scope.success = true;
                    $scope.userMessage = 'Successfully disabled LDAP';
                    $scope.ldapConfig = {};
                  },
                  function(error) {
                    $scope.error = true;
                    $scope.userMessage = 'Error disabling LDAP';
                    console.log(JSON.stringify(error));
                  })
              .finally(function() {
                $scope.loading = false;
              });
          return;
        }
        // Check that all fields are populated before adding or updating config
        if ($scope.ldapConfig.secureLdap == null ||
            !$scope.ldapConfig.ldapType || !$scope.ldapConfig.baseDn ||
            !$scope.ldapConfig.bindDn || !$scope.ldapConfig.searchScope ||
            !$scope.ldapConfig.serverUri || !$scope.ldapConfig.bindDnPassword) {
          // TODO: Highlight the field that is empty
          $scope.loading = false;
          $scope.error = true;
          $scope.userMessage = 'Cannot save with blank fields';
          return;
        }
        // TODO: additional field validation

        // If LDAP is currently disabled add the config
        if (!$scope.ldapConfig.ldapCurrentlyEnabled) {
          APIUtils.createLdapConfig($scope.ldapConfig)
              .then(
                  function(data) {
                    $scope.success = true;
                    $scope.userMessage =
                        'Successfully created LDAP configuration';
                    $scope.ldapDisabled = false;
                  },
                  function(error) {
                    $scope.error = true;
                    $scope.userMessage = 'Error creating LDAP configuration';
                    console.log(JSON.stringify(error));
                  })
              .finally(function() {
                $scope.loading = false;
              });
        } else {
          // TODO: if LDAP is enabled, update with PUT
        }
      };
    }
  ]);
})(angular);
