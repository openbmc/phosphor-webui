/**
 * Controller for Redfish
 *
 * @module app/redfish
 * @exports redfishController
 * @name redfishController
 * @version 0.1.0
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.redfish').controller('redfishController', [
    '$scope', '$http', '$window', 'dataService', '$routeParams',
    function($scope, $http, $window, DataService, $routeParams) {
      $scope.redfishData = {};
      $scope.isObject = angular.isObject;
      $scope.isArray = angular.isArray;
      $scope.loading = true;
      $http({
        method: 'GET',
        url: DataService.getHost() + '/redfish/' + $routeParams.path,
        headers:
            {'Accept': 'application/json', 'Content-Type': 'application/json'},
        withCredentials: true
      })
          .then(
              function(response) {
                $scope.redfishData = response.data;
              },
              function(error) {
                console.log(error);
              })
          .finally(function() {
            $scope.loading = false;
          });
    }

  ]);
})(angular);
