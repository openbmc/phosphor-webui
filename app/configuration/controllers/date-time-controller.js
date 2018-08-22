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
      $scope.bmc = {};
      $scope.host = {};
      $scope.ntp = {servers: []};
      $scope.time_mode = '';
      $scope.time_owner = '';
      $scope.time_owners = ['BMC', 'Host', 'Both', 'Split'];
      $scope.set_time_error = false;
      $scope.set_time_success = false;
      $scope.loading = false;
      var time_path = '/xyz/openbmc_project/time/';
      loadTimeData();

      function loadTimeData() {
        $scope.loading = true;

        var getTimePromise = APIUtils.getTime().then(
            function(data) {
              // The time is returned as Epoch microseconds convert to
              // milliseconds.
              $scope.bmc.date =
                  new Date(data.data[time_path + 'bmc'].Elapsed / 1000);
              // Don't care about milliseconds and don't want them displayed
              $scope.bmc.date.setMilliseconds(0);
              $scope.host.date =
                  new Date(data.data[time_path + 'host'].Elapsed / 1000);
              $scope.host.date.setMilliseconds(0);
              $scope.time_owner =
                  data.data[time_path + 'owner'].TimeOwner.split('.').pop();
              $scope.time_mode = data.data[time_path + 'sync_method']
                                     .TimeSyncMethod.split('.')
                                     .pop();
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        var getNTPPromise = APIUtils.getNTPServers().then(
            function(data) {
              $scope.ntp.servers = data.data;
            },
            function(error) {
              console.log(JSON.stringify(error));
            });


        var promises = [
          getTimePromise,
          getNTPPromise,
        ];

        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      }
      $scope.setTime = function() {
        $scope.set_time_error = false;
        $scope.set_time_success = false;
        $scope.loading = true;
        var promises = [setTimeMode(), setTimeOwner()];

        if ($scope.time_mode == 'NTP') {
          promises.push(setNTPServers());
        }

        $q.all(promises).finally(function() {
          if (!$scope.set_time_error) {
            // Have to set the time mode and time owner first to avoid a
            // insufficient permissions if the time mode or time owner had
            // changed.
            promises = [];
            if ($scope.time_mode == 'Manual' && $scope.time_owner != 'Host') {
              promises.push(setBMCTime());
            }
            if ($scope.time_mode == 'Manual' &&
                ($scope.time_owner == 'Host' || $scope.time_owner == 'Split')) {
              promises.push(setHostTime());
            }
            $q.all(promises).finally(function() {
              $scope.loading = false;
              if (!$scope.set_time_error) {
                $scope.set_time_success = true;
              }
            });
          }
        });
      };
      $scope.refresh = function() {
        $route.reload();
      };

      $scope.addNTPField = function() {
        $scope.ntp.servers.push('');
      };

      function setNTPServers() {
        // Remove any empty strings from the array. Important because we add an
        // empty string to the end so the user can add a new NTP server, if the
        // user doesn't fill out the field, we don't want to add.
        $scope.ntp.servers = $scope.ntp.servers.filter(Boolean);
        // NTP servers does not allow an empty array, since we remove all empty
        // strings above, could have an empty array. TODO: openbmc/openbmc#3240
        if ($scope.ntp.servers.length == 0) {
          $scope.ntp.servers.push('');
        }
        return APIUtils.setNTPServers($scope.ntp.servers)
            .then(
                function(data) {},
                function(error) {
                  $scope.set_time_error = true;
                  console.log(JSON.stringify(error));
                });
      }

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

      function setTimeOwner() {
        return APIUtils
            .setTimeOwner(
                'xyz.openbmc_project.Time.Owner.Owners.' + $scope.time_owner)
            .then(
                function(data) {},
                function(error) {
                  $scope.set_time_error = true;
                  console.log(JSON.stringify(error));
                });
      }

      function setBMCTime() {
        // Add the separate date and time objects and convert to Epoch time in
        // microseconds.
        return APIUtils.setBMCTime($scope.bmc.date.getTime() * 1000)
            .then(
                function(data) {},
                function(error) {
                  $scope.set_time_error = true;
                  console.log(JSON.stringify(error));
                });
      }

      function setHostTime() {
        // Add the separate date and time objects and convert to Epoch time
        // microseconds.
        return APIUtils.setHostTime($scope.host.date.getTime() * 1000)
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
