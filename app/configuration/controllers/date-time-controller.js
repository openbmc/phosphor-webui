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
      $scope.time_mode = '';
      $scope.time_owner = '';
      $scope.loading = false;
      loadTimeData();

      function loadTimeData() {
        $scope.loading = true;

        var getTimePromise = APIUtils.getTime().then(
            function(data) {
              $scope.bmc_time =
                  data.data['/xyz/openbmc_project/time/bmc'].Elapsed / 1000;
              $scope.time_owner = data.data['/xyz/openbmc_project/time/owner']
                                      .TimeOwner.split('.')
                                      .pop();
              $scope.time_mode =
                  data.data['/xyz/openbmc_project/time/sync_method']
                      .TimeSyncMethod.split('.')
                      .pop();
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        var promises = [
          getTimePromise,
        ];

        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      }
    }
  ]);

})(angular);
