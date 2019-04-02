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
    '$scope', '$q', 'APIUtils', 'toastService',
    function($scope, $q, APIUtils, toastService) {
      $scope.users = [];
      $scope.roles = [];
      $scope.loading = true;
      $scope.properties = {};
      $scope.origProp = {};
      $scope.submitted = false;

      function loadUserInfo() {
        $scope.loading = true;
        $scope.submitted = false;
        $scope.isUserSelected = false;
        $scope.selectedUser = {};
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
                  toastService.success(
                      'User account properties have been updated successfully');
                },
                function(error) {
                  toastService.error('Unable to update account properties');
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
        if ($scope.users.length >= 15) {
          toastService.error(
              'Cannot create user. The maximum number of users that can be created is 15');
          return;
        }
        if (!$scope.selectedUser.UserName || !$scope.selectedUser.Password) {
          toastService.error('Username or password cannot be empty');
          return;
        }
        if ($scope.selectedUser.Password !==
            $scope.selectedUser.VerifyPassword) {
          toastService.error('Passwords do not match');
          return;
        }
        if ($scope.doesUserExist()) {
          toastService.error('Username already exists');
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
                  toastService.success('User has been created successfully');
                },
                function(error) {
                  toastService.error('Failed to create new user');
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };
      $scope.updateUserInfo = function() {
        if ($scope.selectedUser.Password !==
            $scope.selectedUser.VerifyPassword) {
          toastService.error('Passwords do not match');
          return;
        }
        if ($scope.doesUserExist()) {
          toastService.error('Username already exists');
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
                  toastService.success('User has been updated successfully');
                },
                function(error) {
                  toastService.error('Unable to update user');
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
                  toastService.success('User has been deleted successfully');
                },
                function(error) {
                  toastService.error('Unable to delete user');
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };

      $scope.doesUserExist = function() {
        for (var i in $scope.users) {
          // If a user exists with the same user name and a different Id then
          // the username already exists and isn't valid
          if (($scope.users[i].UserName === $scope.selectedUser.UserName) &&
              ($scope.users[i].Id !== $scope.selectedUser.Id)) {
            return true;
          }
        }
      };
      loadUserInfo();
    }
  ]);
})(angular);
