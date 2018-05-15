/**
 * Controller for network
 *
 * @module app/configuration
 * @exports networkController
 * @name networkController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('networkController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
      $scope.network = {};
      $scope.interface = {};
      $scope.networkDevice = false;
      $scope.hostname = '';

      $scope.selectInterface = function(interfaceId) {
        $scope.interface = $scope.network.interfaces[interfaceId];
        $scope.selectedInterface = interfaceId;
        $scope.networkDevice = false;
      };
      APIUtils.getNetworkInfo().then(function(data) {
        $scope.network = data.formatted_data;
        $scope.hostname = data.hostname;
        if ($scope.network.interface_ids.length) {
          $scope.selectedInterface = $scope.network.interface_ids[0];
          $scope.interface =
              $scope.network.interfaces[$scope.selectedInterface];
        }
      });
    }
  ]);

})(angular);
