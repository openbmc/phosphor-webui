/**
 * Controller for server
 *
 * @module app/firmware
 * @exports serverController
 * @name serverController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.firmware').controller('serverController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
    }
  ]);

})(angular);
