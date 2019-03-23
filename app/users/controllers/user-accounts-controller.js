/**
 * Controller for user Accounts
 *
 * @module app/users
 * @exports userAccountsController
 * @name userAccountsController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.users').controller('userAccountsController', [
    '$scope', '$q', 'APIUtils', 'ngToast',
    function($scope, $q, APIUtils, ngToast) {
      $scope.users = [];
      $scope.roles = [];
      $scope.loading = true;
      $scope.properties = {};
      $scope.origProp = {};

      function loadUserInfo() {
        $scope.loading = true;
        $scope.isUserSelected = false;
        $scope.selectedUser = null;
        $scope.togglePassword = false;
        $scope.toggleVerify = false;

        $q.all([
            APIUtils.getAllUserAccounts().then(
                function(res) {
                  $scope.users = res;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                }),

            APIUtils.getAllUserAccountProperties().then(
                function(res) {
                  $scope.properties = res;
                  $scope.origProp = angular.copy($scope.properties);
                },
                function(error) {
                  console.log(JSON.stringify(error));
                }),

            APIUtils.getAccountServiceRoles().then(
                function(res) {
                  $scope.roles = res;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
          ]).finally(function() {
          $scope.loading = false;
        });
      };

      $scope.cancel = function() {
        loadUserInfo();
      };

      $scope.saveAllValues = function() {
        $scope.loading = true;
        var data = {};
        if ($scope.properties.AccountLockoutDuration !=
            $scope.origProp.AccountLockoutDuration) {
          data['AccountLockoutDuration'] =
              $scope.properties.AccountLockoutDuration;
        }
        if ($scope.properties.AccountLockoutThreshold !=
            $scope.origProp.AccountLockoutThreshold) {
          data['AccountLockoutThreshold'] =
              $scope.properties.AccountLockoutThreshold;
        }

        if ($scope.properties.AccountLockoutDuration ==
                $scope.origProp.AccountLockoutDuration &&
            $scope.properties.AccountLockoutThreshold ==
                $scope.origProp.AccountLockoutThreshold) {
          // No change in properties, just return;
          $scope.loading = false;
          return;
        }

        APIUtils
            .saveUserAccountProperties(
                data['AccountLockoutDuration'], data['AccountLockoutThreshold'])
            .then(
                function(response) {
                  ngToast.success(
                      'User account properties has been updated successfully');
                },
                function(error) {
                  ngToast.danger('Account Properties Updation failed');
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };

      $scope.setSelectedUser = function(user) {
        $scope.isUserSelected = true;
        $scope.selectedUser = angular.copy(user);
        $scope.selectedUser.VerifyPassword = null;
        // Used while renaming the user.
        $scope.selectedUser.CurrentUserName = $scope.selectedUser.UserName;
      };
      $scope.createNewUser = function() {
        if (!$scope.selectedUser.UserName || !$scope.selectedUser.Password) {
          ngToast.danger('Username or Password can\'t be empty');
          return;
        }
        if ($scope.selectedUser.Password !==
            $scope.selectedUser.VerifyPassword) {
          ngToast.danger('Passwords do not match');
          return;
        }
        var user = $scope.selectedUser.UserName;
        var passwd = $scope.selectedUser.Password;
        var role = $scope.selectedUser.RoleId;
        var enabled = false;
        if ($scope.selectedUser.Enabled != null) {
          enabled = $scope.selectedUser.Enabled;
        }

        $scope.loading = true;
        APIUtils.createUser(user, passwd, role, enabled)
            .then(
                function(response) {
                  ngToast.success('User has been created successfully');
                },
                function(error) {
                  ngToast.danger('Failed to create new user');
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };
      $scope.updateUserInfo = function() {
        if ($scope.selectedUser.Password !==
            $scope.selectedUser.VerifyPassword) {
          ngToast.danger('Passwords do not match');
          return;
        }
        var data = {};
        if ($scope.selectedUser.UserName !==
            $scope.selectedUser.CurrentUserName) {
          data['UserName'] = $scope.selectedUser.UserName;
        }
        $scope.selectedUser.VerifyPassword = null;
        if ($scope.selectedUser.Password != null) {
          data['Password'] = $scope.selectedUser.Password;
        }
        data['RoleId'] = $scope.selectedUser.RoleId;
        data['Enabled'] = $scope.selectedUser.Enabled;

        $scope.loading = true;
        APIUtils
            .updateUser(
                $scope.selectedUser.CurrentUserName, data['UserName'],
                data['Password'], data['RoleId'], data['Enabled'])
            .then(
                function(response) {
                  ngToast.success('User has been updated successfully');
                },
                function(error) {
                  ngToast.danger('Updating user failed');
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };
      $scope.deleteUser = function(userName) {
        $scope.loading = true;
        APIUtils.deleteUser(userName)
            .then(
                function(response) {
                  ngToast.success('User has been deleted successfully');
                },
                function(error) {
                  ngToast.danger('Deleting user failed');
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };

      loadUserInfo();
    }
  ]);
})(angular);
