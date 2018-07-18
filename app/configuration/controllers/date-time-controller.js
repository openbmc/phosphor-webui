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
      $scope.time_mode = '';
      $scope.time_owner = '';
      $scope.loading = true;

      var getTimePromise = APIUtils.getTime().then(
          function(data) {
            $scope.bmc_time =
                data.data['/xyz/openbmc_project/time/bmc'].Elapsed / 1000;
            $scope.host_time =
                data.data['/xyz/openbmc_project/time/host'].Elapsed / 1000;

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

      getTimePromise.finally(function() {
        $scope.loading = false;
      });
    }
  ]);

})(angular);
