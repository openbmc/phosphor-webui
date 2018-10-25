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
    '$scope', 'APIUtils', '$q', 'Constants',
    function($scope, APIUtils, $q, Constants) {
      $scope.groups = [];
      $scope.selectedGroups = [];
      $scope.ldapConfig = {};
      $scope.newGroup = {};
      $scope.activeModal = '';
      $scope.ldapEnabled = false;
      $scope.userPrivileges = [];
      $scope.loading = false;
      $scope.error = false;
      $scope.success = false;
      $scope.userMessage = '';

      $scope.loadLdapInfo = function() {
        $scope.loading = true;
        var getLdapConfiguration = APIUtils.getLdapConfiguration().then(
            function(data) {
              // If LDAP config exists, LDAP is enabled.
              if (data.config) {
                $scope.groups = data.groups;
                $scope.ldapEnabled = true;
                $scope.ldapConfig = {
                  ldapCurrentlyEnabled: true,
                  serverUri: data.config.LDAPServerURI,
                  secureLdap: data.config.SecureLDAP,
                  bindDnPassword: '',
                  baseDn: data.config.LDAPBaseDN,
                  bindDn: data.config.LDAPBindDN,
                  searchScope:
                      Constants.LDAP_DISPLAY_MAP[data.config.LDAPSearchScope],
                  ldapType: Constants.LDAP_DISPLAY_MAP[data.config.LDAPType]
                };
              }
            },
            function(error) {
              console.log(JSON.stringify(error));
            });
        var getUserPrivileges = APIUtils.getUserPrivileges().then(
            function(data) {
              if (data) {
                $scope.userPrivileges = data;
              }
            },
            function(error) {
              console.log(JSON.stringify(error));
            });
        var promises = [getLdapConfiguration, getUserPrivileges];
        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      };

      $scope.$watch('groups', function() {
        $scope.selectedGroups = $scope.groups.filter(function(group) {
          return group.isSelected === true;
        });
      }, true);

      $scope.getSelectedGroup = function() {
        return $scope.selectedGroups[0];
      };

      $scope.saveGroupSettings = function() {
        $scope.loading = true;
        $scope.error = false;
        $scope.userMessage = '';
        if ($scope.activeModal === 'add') {
          for (var i = 0; i < $scope.groups.length; i++) {
            if ($scope.groups[i].groupName === $scope.newGroup.name) {
              $scope.error = true;
              $scope.userMessage =
                  'Error adding Role Group. Role Group with the name ' +
                  $scope.newGroup.name + ' already exists';
              $scope.loading = false;
              $scope.activeModal = '';
              return;
            }
          }
          APIUtils
              .createLdapGroup($scope.newGroup.name, $scope.newGroup.privilege)
              .then(
                  function(data) {
                    $scope.loadLdapInfo();
                  },
                  function(error) {
                    $scope.error = true;
                    $scope.userMessage =
                        'Error adding Role Group ' + $scope.newGroup.name;
                    console.log(JSON.stringify(error));
                  })
              .finally(function() {
                $scope.newGroup = {};
                $scope.loading = false;
                $scope.activeModal = ''
              });
        } else if ($scope.activeModal === 'delete') {
          APIUtils.deleteLdapGroups($scope.selectedGroups)
              .then(
                  function(data) {
                    $scope.loadLdapInfo();
                  },
                  function(error) {
                    $scope.error = true;
                    $scope.userMessage = 'Error removing Role Group(s)';
                    console.log(JSON.stringify(error));
                  })
              .finally(function() {
                $scope.loading = false;
                $scope.activeModal = ''
              });
        } else if ($scope.activeModal === 'modify') {
          var selectedGroup = $scope.getSelectedGroup();
          APIUtils.modifyLdapGroup(selectedGroup.id, selectedGroup.privilege)
              .then(
                  function(data) {
                    $scope.loadLdapInfo();
                  },
                  function(error) {
                    $scope.error = true;
                    $scope.userMessage = 'Error modifying Role Group';
                    console.log(JSON.stringify(error));
                  })
              .finally(function() {
                $scope.loading = false;
                $scope.activeModal = ''
              });
        }
      };
      $scope.loadLdapInfo();
    }
  ]);
})(angular);
