window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('ldapConfiguration', [
    function() {
      return {
        'restrict': 'E',
        'template': require('./ldap-configuration.html'),
        'controller': [
          '$scope', 'APIUtils',
          function($scope, APIUtils) {
            $scope.searchScopes = ['sub', 'one', 'base'];
            $scope.ldapTypes = ['Active Directory', 'OpenLDAP'];
            $scope.saveLdapSettings = function() {
              $scope.loading = true;
              $scope.error = false;
              $scope.userMessage = '';
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
              // Check that all fields are populated before adding or updating
              // config
              if ($scope.ldapConfig.secureLdap == null ||
                  !$scope.ldapConfig.ldapType || !$scope.ldapConfig.baseDn ||
                  !$scope.ldapConfig.bindDn || !$scope.ldapConfig.searchScope ||
                  !$scope.ldapConfig.serverUri ||
                  !$scope.ldapConfig.bindDnPassword) {
                // TODO: Highlight the field that is empty
                $scope.loading = false;
                $scope.error = true;
                $scope.userMessage = 'All fields are required.';
                return;
              }
              // Secure LDAP uri --> ldaps://
              // Unencrypted LDAP uri --> ldap://
              var secureLdap = $scope.ldapConfig.secureLdap;
              var serverUri = $scope.ldapConfig.serverUri;
              if (secureLdap === true && !serverUri.startsWith('ldaps://') ||
                  secureLdap === false && !serverUri.startsWith('ldap://')) {
                $scope.loading = false;
                $scope.error = true;
                $scope.userMessage =
                    (secureLdap ? 'SSL secured ' : 'Unencrypted ') +
                    'LDAP URI must begin with ' +
                    (secureLdap ? 'ldaps://' : 'ldap://');
                return;
              }
              // If LDAP is currently disabled add the config
              if (!$scope.ldapConfig.ldapCurrentlyEnabled) {
                APIUtils.createLdapConfig($scope.ldapConfig)
                    .then(
                        function(data) {
                          $scope.success = true;
                          $scope.userMessage =
                              'Successfully created LDAP configuration';
                          $scope.loadLdapInfo();
                        },
                        function(error) {
                          $scope.error = true;
                          $scope.userMessage =
                              'Error creating LDAP configuration';
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
        ]
      };
    }
  ]);
})(window.angular);
