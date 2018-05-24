/**
 * Controller for server
 *
 * @module app/serverHealth
 * @exports powerConsumptionController
 * @name powerConsumptionController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverHealth').controller('powerConsumptionController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
    }
  ]);

})(angular);
