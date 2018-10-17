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

        APIUtils.getUserAccounts().then(
            function(data) {
              for (var i = 0; i < data['Members@odata.count']; i++) {
                var member = data.Members[i];
                var uri = member['@odata.id'];

                APIUtils.doGet(uri).then(
                    function(user) {
                      $scope.users.push(user);
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                    });
              }

              $scope.loading = false;
            },
            function(error) {
              console.log(JSON.stringify(error));
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

        APIUtils.createUser(user, passwd, role, enabled)
            .then(
                function(response) {
                  $scope.state = 'success';
                  if (response.data['@Message.ExtendedInfo'] != undefined) {
                    $scope.outMsg =
                        response.data['@Message.ExtendedInfo'][0].Message;
                  }
                  loadUserInfo();
                },
                function(error) {
                  $scope.state = 'error';
                  $scope.outMsg =
                      error.data.error['@Message.ExtendedInfo'][0].Message;
                  loadUserInfo();
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

        APIUtils.updateUser($scope.selectedUser.CurrentUserName, data)
            .then(
                function(response) {
                  $scope.state = 'success';
                  if (response.data['@Message.ExtendedInfo'] != undefined) {
                    $scope.outMsg =
                        response.data['@Message.ExtendedInfo'][0].Message;
                  }
                  loadUserInfo();
                },
                function(error) {
                  $scope.state = 'error';
                  $scope.outMsg =
                      error.data.error['@Message.ExtendedInfo'][0].Message;
                  loadUserInfo();
                });
      };
      $scope.deleteUser = function(userName) {
        $scope.state = 'none';
        $scope.outMsg = '';

        APIUtils.deleteUser(userName).then(
            function(response) {
              $scope.state = 'success';
              if (response.data['@Message.ExtendedInfo'] != undefined) {
                $scope.outMsg =
                    response.data['@Message.ExtendedInfo'][0].Message;
              }
              loadUserInfo();
            },
            function(error) {
              $scope.state = 'error';
              $scope.outMsg =
                  error.data.error['@Message.ExtendedInfo'][0].Message;
              loadUserInfo();
            });
      };
    }
  ]);
})(angular);
