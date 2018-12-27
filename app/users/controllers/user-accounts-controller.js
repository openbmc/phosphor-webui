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
    '$scope', 'APIUtils',
    function($scope, APIUtils) {
      $scope.state = 'none';
      $scope.outMsg = '';
      $scope.loading = true;

      function loadUserInfo() {
        $scope.users = [];
        $scope.loading = true;
        $scope.isUserSelected = false;
        $scope.selectedUser = null;

        APIUtils.getAllUserAccounts()
            .then(
                function(res) {
                  $scope.users = res;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.loading = false;
            });
      };

      function getUserRoles() {
        $scope.roles = [];
        $scope.loading = true;

        APIUtils.getAccountServiceRoles()
            .then(
                function(res) {
                  $scope.roles = res;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.loading = false;
            });
      };

      $scope.cancel = function() {
        $scope.state = 'none';
        $scope.outMsg = '';
        loadUserInfo();
      };
      $scope.setSelectedUser = function(user) {
        $scope.state = 'none';
        $scope.outMsg = '';

        $scope.isUserSelected = true;
        $scope.selectedUser = angular.copy(user);
        $scope.selectedUser.VerifyPassword = null;
        // Used while renaming the user.
        $scope.selectedUser.CurrentUserName = $scope.selectedUser.UserName;
      };
      $scope.createNewUser = function() {
        $scope.state = 'none';
        $scope.outMsg = '';

        if (!$scope.selectedUser.UserName || !$scope.selectedUser.Password) {
          $scope.state = 'error';
          $scope.outMsg = 'Username or Password can\'t be empty';
          return;
        }
        if ($scope.selectedUser.Password !==
            $scope.selectedUser.VerifyPassword) {
          $scope.state = 'error';
          $scope.outMsg = 'Passwords do not match';
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
                  $scope.state = 'success';
                  $scope.outMsg = 'User has been created successfully';
                },
                function(error) {
                  $scope.state = 'error';
                  if ((error.data.error['@Message.ExtendedInfo'] !=
                       undefined) &&
                      (error.data.error['@Message.ExtendedInfo'].length != 0)) {
                    $scope.outMsg =
                        error.data.error['@Message.ExtendedInfo'][0].Message;
                  } else {
                    $scope.outMsg = 'Failed to create new user.';
                  }
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };
      $scope.updateUserInfo = function() {
        $scope.state = 'none';
        $scope.outMsg = '';
        if ($scope.selectedUser.Password !==
            $scope.selectedUser.VerifyPassword) {
          $scope.state = 'error';
          $scope.outMsg = 'Passwords do not match';
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
                  $scope.state = 'success';
                  $scope.outMsg = 'User has been updated successfully';
                },
                function(error) {
                  $scope.state = 'error';
                  if ((error.data.error['@Message.ExtendedInfo'] !=
                       undefined) &&
                      (error.data.error['@Message.ExtendedInfo'].length != 0)) {
                    $scope.outMsg =
                        error.data.error['@Message.ExtendedInfo'][0].Message;
                  } else {
                    $scope.outMsg = 'Updating user failed.';
                  }
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };
      $scope.deleteUser = function(userName) {
        $scope.state = 'none';
        $scope.outMsg = '';

        $scope.loading = true;
        APIUtils.deleteUser(userName)
            .then(
                function(response) {
                  $scope.state = 'success';
                  $scope.outMsg = 'User has been deleted successfully';
                },
                function(error) {
                  $scope.state = 'error';
                  if ((error.data.error['@Message.ExtendedInfo'] !=
                       undefined) &&
                      (error.data.error['@Message.ExtendedInfo'].length != 0)) {
                    $scope.outMsg =
                        error.data.error['@Message.ExtendedInfo'][0].Message;
                  } else {
                    $scope.outMsg = 'Deleting user failed.';
                  }
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };

      getUserRoles();
      loadUserInfo();
    }
  ]);
})(angular);
