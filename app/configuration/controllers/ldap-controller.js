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
    '$scope', 'APIUtils', '$q',
    function($scope, APIUtils, $q) {
      $scope.groups = [];
      $scope.ldapConfig = {};
      $scope.newGroup = {};
      $scope.selectedIndex = '';
      $scope.activeModal = '';
      $scope.ldapDisabled = true;
      $scope.loading = true;
      $scope.error = false;
      $scope.success = false;
      $scope.userMessage = '';

      loadLdapInfo();

      function loadLdapInfo() {
        var getLdapConfiguration = APIUtils.getLdapConfiguration().then(
            function(data) {
              // If LDAP config exists, LDAP is enabled.
              if (data.config) {
                $scope.groups = data.groups;
                $scope.ldapDisabled = false;
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
      }
      $scope.saveGroupSettings = function(selectedIndex) {
        $scope.loading = true;
        if ($scope.activeModal === 'add') {
          if (!$scope.newGroup.name || !$scope.newGroup.privilege) {
            // TODO: Highlight blank fields
            $scope.error = true;
            $scope.userMessage =
                'Error creating Role Group. There must be no blank fields';
            $scope.loading = false;
            $scope.activeModal = '';
            return;
          }
          for (var i = 0; i < $scope.groups.length; i++) {
            if ($scope.groups[i].groupName === $scope.newGroup.name) {
              $scope.error = true;
              $scope.userMessage =
                  'Error creating Role Group. Role Group with the name ' +
                  $scope.newGroup.name + ' already exists';
              $scope.loading = false;
              $scope.activeModal = '';
              return;
            }
          }
          APIUtils
              .createRoleGroup($scope.newGroup.name, $scope.newGroup.privilege)
              .then(
                  function(data) {
                    loadLdapInfo();
                  },
                  function(error) {
                    $scope.error = true;
                    $scope.userMessage =
                        'Error creating Role Group ' + $scope.newGroup.name;
                    console.log(JSON.stringify(error));
                  })
              .finally(function() {
                $scope.newGroup = {};
                $scope.loading = false;
                $scope.activeModal = ''
              });
        } else if ($scope.activeModal === 'delete') {
          APIUtils
              .deleteObject(
                  '/xyz/openbmc_project/user/ldap/' +
                  $scope.groups[selectedIndex].id)
              .then(
                  function(data) {
                    loadLdapInfo();
                  },
                  function(error) {
                    $scope.error = true;
                    $scope.userMessage = 'Error deleting Role Group ' +
                        $scope.groups[selectedIndex].groupName;
                    console.log(JSON.stringify(error));
                  })
              .finally(function() {
                $scope.loading = false;
                $scope.activeModal = ''
              });
        }
        // TODO: Modify Role Groups with PUT
      }
    }
  ]);
})(angular);
