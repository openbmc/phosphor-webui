/**
 * Controller for user Accounts
 *
 * @module app/users
 * @exports manageAccountsController
 * @name manageAccountsController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.users').controller('manageAccountsController', [
    '$scope', 'APIUtils',
    function($scope, APIUtils) {
      // TODO: Get the roles using Roles redfish URI.
      $scope.roles = ['Administrator', 'Operator', 'User', 'Callback'];
      $scope.state = 'none';
      $scope.outMsg = '';

      loadUserInfo();

      function loadUserInfo() {
        $scope.users = [];
        $scope.loading = true;
        $scope.isUserSelected = false;
        $scope.selectedUser = null;

        APIUtils.getUserAccountCollections()
            .then(
                function(res) {
                  APIUtils.getMembersFullData(res.data['Members'])
                      .then(
                          function(data) {
                            $scope.users = data;
                          },
                          function(error) {
                            console.log(JSON.stringify(error));
                          });
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.loading = false;
            });
      };

      $scope.cancel = function() {
        $scope.isUserSelected = false;
        $scope.selectedUser = null;
        $scope.state = 'none';
        $scope.outMsg = '';
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

        if (!$scope.selectedUser.UserName || !$scope.selectedUser.Password ||
            !$scope.selectedUser.VerifyPassword) {
          $scope.state = 'error';
          $scope.outMsg =
              'Username or Password or verify password can\'t be empty';
          return;
        }
        if ($scope.selectedUser.Password !==
            $scope.selectedUser.VerifyPassword) {
          $scope.state = 'error';
          $scope.outMsg = 'Passwords do not match';
          return;
        }
        $scope.selectedUser.VerifyPassword = null;
        var user = $scope.selectedUser.UserName;
        var passwd = $scope.selectedUser.Password;
        var role = $scope.selectedUser.RoleId;
        var enabled = $scope.selectedUser.Enabled;

        $scope.loading = true;
        APIUtils.createUser(user, passwd, role, enabled)
            .then(
                function(response) {
                  $scope.state = 'success';
                  if (response.data['@Message.ExtendedInfo'] != undefined) {
                    $scope.outMsg =
                        response.data['@Message.ExtendedInfo'][0].Message;
                  }
                },
                function(error) {
                  $scope.state = 'error';
                  $scope.outMsg =
                      error.data.error['@Message.ExtendedInfo'][0].Message;
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
        APIUtils.updateUser($scope.selectedUser.CurrentUserName, data)
            .then(
                function(response) {
                  $scope.state = 'success';
                  if (response.data['@Message.ExtendedInfo'] != undefined) {
                    $scope.outMsg =
                        response.data['@Message.ExtendedInfo'][0].Message;
                  }
                },
                function(error) {
                  $scope.state = 'error';
                  $scope.outMsg =
                      error.data.error['@Message.ExtendedInfo'][0].Message;
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
                  if (response.data['@Message.ExtendedInfo'] != undefined) {
                    $scope.outMsg =
                        response.data['@Message.ExtendedInfo'][0].Message;
                  }
                },
                function(error) {
                  $scope.state = 'error';
                  $scope.outMsg =
                      error.data.error['@Message.ExtendedInfo'][0].Message;
                })
            .finally(function() {
              loadUserInfo();
              $scope.loading = false;
            });
      };
    }
  ]);
})(angular);
