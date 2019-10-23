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
    function($scope, $window, dataService, userModel, $location, APIUtils) {
      $scope.dataService = dataService;
      $scope.serverUnreachable = false;
      $scope.invalidCredentials = false;
      $scope.host = $scope.dataService.host.replace(/^https?\:\/\//ig, '');
      $scope.isPasswordValid = true;
      $scope.successPasswordChange = false;
      $scope.failedPasswordChange = false;
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
                if (description === 'Unauthorized') {
                  $scope.invalidCredentials = true;
                }

                else if (!isPasswordValid) {
                  $scope.isPasswordValid = isPasswordValid;
                } else if (status) {
                  $scope.$emit('user-logged-in', {});
                  var next = $location.search().next;
                  if (next === undefined || next == null) {
                    $window.location.hash = '#/overview/server';
                  } else {
                    $window.location.href = next;
                  }
                } else {
                  $scope.serverUnreachable = true;
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
              $scope.successPasswordChange = true;
            })
            .catch((error) => {
              $scope.failedPasswordChange = true;
            })
      };

      $scope.back = function() {
        $scope.isPasswordValid = true;
        $scope.passwordReset.confirmPassword = '';
      };
    },
  ]);
})(angular);
