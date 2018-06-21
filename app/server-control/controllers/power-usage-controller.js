/**
 * Controller for power-usage
 *
 * @module app/serverControl
 * @exports powerUsageController
 * @name powerUsageController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('powerUsageController', [
    '$scope', '$window', 'APIUtils', 'dataService', '$q',
    function($scope, $window, APIUtils, dataService, $q) {
      $scope.dataService = dataService;
      $scope.power_consumption = '';
      $scope.loading = false;
      loadPowerData();

      function loadPowerData() {
        $scope.loading = true;
        var getPowerConsumptionPromise = APIUtils.getPowerConsumption().then(
            function(data) {
              $scope.power_consumption = data;
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        var promises = [
          getPowerConsumptionPromise,
        ];

        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      }
    }
  ]);

})(angular);
