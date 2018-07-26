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
    '$scope', '$window', 'APIUtils', '$route', '$q',
    function($scope, $window, APIUtils, $route, $q) {
      $scope.bmc_time = '';
      $scope.time_mode = '';
      $scope.time_owner = '';
      $scope.set_time_error = false;
      $scope.set_time_success = false;
      $scope.loading = false;
      var time_path = '/xyz/openbmc_project/time/';
      loadTimeData();

      function loadTimeData() {
        $scope.loading = true;

        var getTimePromise = APIUtils.getTime().then(
            function(data) {
              $scope.bmc_time = data.data[time_path + 'bmc'].Elapsed / 1000;
              $scope.host_time = data.data[time_path + 'host'].Elapsed / 1000;

              $scope.time_owner =
                  data.data[time_path + 'owner'].TimeOwner.split('.').pop();
              $scope.time_mode = data.data[time_path + 'sync_method']
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
      $scope.setTime = function() {
        $scope.set_time_error = false;
        $scope.set_time_success = false;
        $scope.loading = true;
        var promises = [
          setTimeMode(),
        ];

        $q.all(promises).finally(function() {
          $scope.loading = false;
          if (!$scope.set_time_error) {
            $scope.set_time_success = true;
          }
        });
      };
      $scope.refresh = function() {
        $route.reload();
      };

      function setTimeMode() {
        return APIUtils
            .setTimeMode(
                'xyz.openbmc_project.Time.Synchronization.Method.' +
                $scope.time_mode)
            .then(
                function(data) {},
                function(error) {
                  $scope.set_time_error = true;
                  console.log(JSON.stringify(error));
                });
      }
    }
  ]);

})(angular);
