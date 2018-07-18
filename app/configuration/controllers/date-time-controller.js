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
    '$scope', '$window', 'APIUtils', 'dataService', '$q',
    function($scope, $window, APIUtils, dataService, $q) {
      $scope.dataService = dataService;
      $scope.bmc_time = '';
      $scope.loading = false;
      loadTimeData();

      function loadTimeData() {
        $scope.loading = true;

        var getBMCTimePromise = APIUtils.getBMCTime().then(
            function(data) {
              $scope.bmc_time = data.data.Elapsed / 1000;
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        var promises = [
          getBMCTimePromise,
        ];

        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      }
    }
  ]);

})(angular);
