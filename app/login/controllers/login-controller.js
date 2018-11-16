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
    '$scope', '$window', 'dataService', 'userModel', '$location',
    function($scope, $window, dataService, userModel, $location) {
      $scope.dataService = dataService;
      $scope.host = $scope.dataService.host.replace(/^https?\:\/\//ig, '');

      $scope.tryLogin = function(host, username, password, event) {
        // keyCode 13 is the 'Enter' button. If the user hits 'Enter' while in
        // one of the 3 fields, attempt to log in.
        if (event.keyCode === 13) {
          $scope.login(host, username, password);
        }
      };
      $scope.login = function(host, username, password) {
        $scope.error = false;
        $scope.description = 'Error logging in';

        if (!username || username == '' || !password || password == '' ||
            !host || host == '') {
          return false;
        } else {
          $scope.dataService.setHost(host);
          userModel.login(username, password, function(status, description) {
            if (status) {
              $scope.$emit('user-logged-in', {});
              var next = $location.search().next;
              if (next === undefined || next == null) {
                $window.location.hash = '#/overview/server';
              } else {
                $window.location.href = next;
              }
            } else {
              $scope.error = true;
              if (description) {
                $scope.description = description;
              }
            }
          });
        }
      };
    },
  ]);
})(angular);
