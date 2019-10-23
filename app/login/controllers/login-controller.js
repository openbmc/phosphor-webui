/**
 * Controller for the login page
 *
 * @module app/login/controllers/index
 * @exports LoginController
 * @name LoginController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.login').controller('LoginController', [
    '$scope',
    '$window',
    'dataService',
    'userModel',
    '$location',
    'APIUtils',
    'toastService',
    function(
        $scope, $window, dataService, userModel, $location, APIUtils,
        toastService) {
      $scope.dataService = dataService;
      $scope.serverUnreachable = false;
      $scope.invalidCredentials = false;
      $scope.host = $scope.dataService.host.replace(/^https?\:\/\//ig, '');
      $scope.isPasswordValid = true;
      $scope.passwordReset = {};

      $scope.login = function(host, username, password) {
        $scope.serverUnreachable = false;
        $scope.invalidCredentials = false;
        $scope.username = username;
        if (!username || username == '' || !password || password == '' ||
            !host || host == '') {
          return false;
        } else {
          $scope.dataService.setHost(host);
          userModel.login(
              username, password,
              function(status, isPasswordValid, description) {
                if (status && isPasswordValid) {
                  $scope.$emit('user-logged-in', {});
                  var next = $location.search().next;
                  if (next === undefined || next == null) {
                    $window.location.hash = '#/overview/server';
                  } else {
                    $window.location.href = next;
                  }
                }
                // checks if the password is expired
                else if (!isPasswordValid) {
                  $scope.isPasswordValid = isPasswordValid;
                } else {
                  if (description === 'Unauthorized') {
                    $scope.invalidCredentials = true;
                  } else {
                    $scope.serverUnreachable = true;
                  }
                }
              });
        }
      };

      $scope.changePassword = function() {
        var passwordResetLocal = {};
        passwordResetLocal.confirmPassword =
            $scope.passwordReset.confirmPassword;

        APIUtils
            .changePassword(
                $scope.username, $scope.passwordReset.confirmPassword)
            .then(() => {
              $scope.isPasswordValid = true;
              toastService.success('Successfully changed password.');
            })
            .catch((error) => {
              toastService.error('Failed to change password.');
            })
            .finally(() => {});
      };

      $scope.back = function() {
        $scope.isPasswordValid = true;
        $scope.passwordReset.confirmPassword = '';
      };
    },
  ]);
})(angular);
