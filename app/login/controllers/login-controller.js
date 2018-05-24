/**
 * Controller for the login page
 *
 * @module app/login/controllers/index
 * @exports LoginController
 * @name LoginController
 */

window.angular && (function(angular) {
  'use strict';

  angular
    .module('app.login')
    .controller('LoginController', [
      '$scope',
      '$window',
      'APIUtils',
      'dataService',
      'userModel',
      '$routeParams',
      function($scope, $window, APIUtils, dataService, userModel, $routeParams) {
        $scope.dataService = dataService;
        $scope.host = $scope.dataService.host.replace(/^https?\:\/\//ig, '');

        $scope.tryLogin = function(host, username, password, event) {
          if (event.keyCode === 13) {
            $scope.login(host, username, password);
          }
        };
        $scope.login = function(host, username, password) {
          $scope.error = false;
          $scope.description = false;

          if (!username || username == '' ||
            !password || password == '' ||
            !host || host == ''
          ) {
            return false;
          }
          else {
            $scope.dataService.setHost(host);
            userModel.login(username, password, function(status, description) {
              if (status) {
                $scope.$emit('user-logged-in', {});
                $window.location.hash = '#/overview/server';
              }
              else {
                $scope.error = true;
                if (description) {
                  $scope.description = description;
                }
              }
            });
          }
        };
      }
    ]);

})(angular);
