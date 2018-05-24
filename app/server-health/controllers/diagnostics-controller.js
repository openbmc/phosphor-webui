/**
 * Controller for server
 *
 * @module app/serverHealth
 * @exports diagnosticsController
 * @name diagnosticsController
 */

window.angular && (function(angular) {
  'use strict';

  angular
    .module('app.serverHealth')
    .controller('diagnosticsController', [
      '$scope',
      '$window',
      'APIUtils',
      'dataService',
      function($scope, $window, APIUtils, dataService) {
        $scope.dataService = dataService;
      }
    ]);

})(angular);
