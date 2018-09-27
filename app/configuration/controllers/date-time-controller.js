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
      $scope.loading = true;
      var time_path = '/xyz/openbmc_project/time/';

      var getTimePromise = APIUtils.getTime().then(
          function(data) {
            // The time is returned as Epoch microseconds convert to
            // milliseconds.
            if (data.data[time_path + 'bmc'] &&
                data.data[time_path + 'bmc'].hasOwnProperty('Elapsed')) {
              $scope.bmc.date =
                  new Date(data.data[time_path + 'bmc'].Elapsed / 1000);
              // Don't care about milliseconds and don't want them displayed
              $scope.bmc.date.setMilliseconds(0);
              // https://stackoverflow.com/questions/1091372/getting-the-clients-timezone-in-javascript
              // GMT-0400 (EDT)
              $scope.bmc.timezone =
                  $scope.bmc.date.toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
            }
            if (data.data[time_path + 'host'] &&
                data.data[time_path + 'host'].hasOwnProperty('Elapsed')) {
              $scope.host.date =
                  new Date(data.data[time_path + 'host'].Elapsed / 1000);
              $scope.host.date.setMilliseconds(0);
              $scope.host.timezone =
                  $scope.host.date.toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1];
            }
            if (data.data[time_path + 'owner'] &&
                data.data[time_path + 'owner'].hasOwnProperty('TimeOwner')) {
              $scope.time_owner =
                  data.data[time_path + 'owner'].TimeOwner.split('.').pop();
            }
            if (data.data[time_path + 'sync_method'] &&
                data.data[time_path + 'sync_method'].hasOwnProperty(
                    'TimeSyncMethod')) {
              $scope.time_mode = data.data[time_path + 'sync_method']
                                     .TimeSyncMethod.split('.')
                                     .pop();
            }
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

      $scope.setTime = function() {
        $scope.set_time_error = false;
        $scope.set_time_success = false;
        $scope.loading = true;
        var promises = [setTimeMode(), setTimeOwner(), setNTPServers()];

        $q.all(promises).then(
            function() {
              // Have to set the time mode and time owner first to avoid a
              // insufficient permissions if the time mode or time owner had
              // changed.
              var manual_promises = [];
              if ($scope.time_mode == 'Manual') {
                // If owner is 'Split' set both.
                // If owner is 'Host' set only it.
                // Else set BMC only. See:
                // https://github.com/openbmc/phosphor-time-manager/blob/master/README.md
                if ($scope.time_owner != 'Host') {
                  manual_promises.push(setBMCTime());
                }

                if ($scope.time_owner == 'Host') {
                  manual_promises.push(setHostTime());
                }
              }
              // Set the Host if Split even if NTP.
              if ($scope.time_owner == 'Split') {
                manual_promises.push(setHostTime());
              }

              $q.all(manual_promises)
                  .then(
                      function() {
                        $scope.set_time_success = true;
                      },
                      function(errors) {
                        console.log(JSON.stringify(errors));
                        $scope.set_time_error = true;
                      })
                  .finally(function() {
                    $scope.loading = false;
                  });
            },
            function(errors) {
              console.log(JSON.stringify(errors));
              $scope.set_time_error = true;
              $scope.loading = false;
            });
      };
      $scope.refresh = function() {
        $route.reload();
      };

      $scope.addNTPField = function() {
        $scope.ntp.servers.push('');
      };

      $scope.removeNTPField = function(index) {
        $scope.ntp.servers.splice(index, 1);
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
        return APIUtils.setNTPServers($scope.ntp.servers);
      }

      function setTimeMode() {
        return APIUtils.setTimeMode(
            'xyz.openbmc_project.Time.Synchronization.Method.' +
            $scope.time_mode);
      }

      function setTimeOwner() {
        return APIUtils.setTimeOwner(
            'xyz.openbmc_project.Time.Owner.Owners.' + $scope.time_owner);
      }

      function setBMCTime() {
        // Add the separate date and time objects and convert to Epoch time in
        // microseconds.
        return APIUtils.setBMCTime($scope.bmc.date.getTime() * 1000);
      }

      function setHostTime() {
        // Add the separate date and time objects and convert to Epoch time
        // microseconds.
        return APIUtils.setHostTime($scope.host.date.getTime() * 1000);
      }
    }
  ]);
})(angular);
