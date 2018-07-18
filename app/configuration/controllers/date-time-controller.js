/**
 * Controller for date-time
 *
 * @module app/configuration
 * @exports dateTimeController
 * @name dateTimeController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('dateTimeController', [
    '$scope', '$window', 'APIUtils',
    function($scope, $window, APIUtils) {
      $scope.bmc_time = '';
      $scope.loading = true;

      var getBMCTimePromise = APIUtils.getBMCTime().then(
          function(data) {
            $scope.bmc_time = data.data.Elapsed / 1000;
          },
          function(error) {
            console.log(JSON.stringify(error));
          });

      getBMCTimePromise.finally(function() {
        $scope.loading = false;
      });
    }
  ]);
})(angular);
