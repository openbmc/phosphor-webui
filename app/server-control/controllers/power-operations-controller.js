/**
 * Controller for power-operations
 *
 * @module app/serverControl
 * @exports powerOperationsController
 * @name powerOperationsController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('powerOperationsController', [
    '$scope', 'APIUtils', 'dataService', 'Constants', '$timeout', '$interval',
    '$interpolate', '$q', 'toastService',
    function(
        $scope, APIUtils, dataService, Constants, $timeout, $interval,
        $interpolate, $q, toastService) {
      $scope.dataService = dataService;
      $scope.confirm = false;
      $scope.confirmWarmReboot = false;
      $scope.confirmColdReboot = false;
      $scope.confirmOrderlyShutdown = false;
      $scope.confirmImmediateShutdown = false;
      $scope.loading = true;

      var pollChassisStatusTimer = undefined;
      var pollStartTime = null;

      //@TODO: call api and get proper state

      APIUtils.getLastPowerTime()
          .then(
              function(data) {
                if (data.data == 0) {
                  $scope.powerTime = 'not available';
                } else {
                  $scope.powerTime = data.data;
                }
              },
              function(error) {
                console.log(JSON.stringify(error));
              })
          .finally(function() {
            $scope.loading = false;
          });

      $scope.toggleState = function() {
        dataService.server_state =
            (dataService.server_state == 'Running') ? 'Off' : 'Running';
      };

      $scope.powerOn = function() {
        $scope.loading = true;
        dataService.setUnreachableState();
        APIUtils.hostPowerOn()
            .then(function(response) {
              return response;
            })
            .then(function(lastStatus) {
              return APIUtils.pollHostStatusTillOn();
            })
            .then(function(hostState) {
              $scope.loading = false;
            })
            .catch(function(error) {
              toastService.error(Constants.MESSAGES.POWER_OP.POWER_ON_FAILED);
              $scope.loading = false;
            });
      };

      function pollChassisStatusTillOff() {
        var deferred = $q.defer();
        pollChassisStatusTimer = $interval(function() {
          var now = new Date();
          if ((now.getTime() - pollStartTime.getTime()) >=
              Constants.TIMEOUT.CHASSIS_OFF) {
            $interval.cancel(pollChassisStatusTimer);
            pollChassisStatusTimer = undefined;
            deferred.reject(
                new Error(Constants.MESSAGES.POLL.CHASSIS_OFF_TIMEOUT));
          }
          APIUtils.getChassisState()
              .then(function(state) {
                if (state === Constants.CHASSIS_POWER_STATE.off_code) {
                  $interval.cancel(pollChassisStatusTimer);
                  pollChassisStatusTimer = undefined;
                  deferred.resolve(state);
                }
              })
              .catch(function(error) {
                $interval.cancel(pollChassisStatusTimer);
                pollChassisStatusTimer = undefined;
                deferred.reject(error);
              });
        }, Constants.POLL_INTERVALS.POWER_OP);

        return deferred.promise;
      }
      $scope.warmReboot = function() {
        $scope.loading = true;
        dataService.setUnreachableState();
        APIUtils.hostReboot()
            .then(function(response) {
              return response;
            })
            .then(function(lastStatus) {
              return APIUtils.pollHostStatusTilReboot();
            })
            .then(function(hostState) {
              $scope.loading = false;
            })
            .catch(function(error) {
              toastService.error(
                  Constants.MESSAGES.POWER_OP.WARM_REBOOT_FAILED);
              $scope.loading = false;
            });
      };

      $scope.warmRebootConfirm = function() {
        if ($scope.confirm) {
          return;
        }
        $scope.confirm = true;
        $scope.confirmWarmReboot = true;
      };

      $scope.coldReboot = function() {
        $scope.loading = true;
        dataService.setUnreachableState();
        APIUtils.chassisPowerOff()
            .then(function(state) {
              return state;
            })
            .then(function(lastState) {
              pollStartTime = new Date();
              return pollChassisStatusTillOff();
            })
            .then(function(chassisState) {
              return APIUtils.hostPowerOn().then(function(hostState) {
                return hostState;
              });
            })
            .then(function(hostState) {
              return APIUtils.pollHostStatusTillOn();
            })
            .then(function(state) {
              $scope.loading = false;
            })
            .catch(function(error) {
              toastService.error(
                  Constants.MESSAGES.POWER_OP.COLD_REBOOT_FAILED);
              $scope.loading = false;
            });
      };
      $scope.coldRebootConfirm = function() {
        if ($scope.confirm) {
          return;
        }
        $scope.confirm = true;
        $scope.confirmColdReboot = true;
      };

      $scope.orderlyShutdown = function() {
        $scope.loading = true;
        dataService.setUnreachableState();
        APIUtils.hostPowerOff()
            .then(function(response) {
              return response;
            })
            .then(function(lastStatus) {
              return APIUtils.pollHostStatusTillOff();
            })
            .then(function(hostState) {
              pollStartTime = new Date();
              return pollChassisStatusTillOff();
            })
            .then(function(chassisState) {
              $scope.loading = false;
            })
            .catch(function(error) {
              toastService.error(
                  Constants.MESSAGES.POWER_OP.ORDERLY_SHUTDOWN_FAILED);
              $scope.loading = false;
            });
      };
      $scope.orderlyShutdownConfirm = function() {
        if ($scope.confirm) {
          return;
        }
        $scope.confirm = true;
        $scope.confirmOrderlyShutdown = true;
      };

      $scope.immediateShutdown = function() {
        $scope.loading = true;
        dataService.setUnreachableState();
        APIUtils.chassisPowerOff()
            .then(function(response) {
              return response;
            })
            .then(function(lastStatus) {
              pollStartTime = new Date();
              return pollChassisStatusTillOff();
            })
            .then(function(chassisState) {
              dataService.setPowerOffState();
              $scope.loading = false;
            })
            .catch(function(error) {
              toastService.error(
                  Constants.MESSAGES.POWER_OP.IMMEDIATE_SHUTDOWN_FAILED);
              $scope.loading = false;
            });
      };
      $scope.immediateShutdownConfirm = function() {
        if ($scope.confirm) {
          return;
        }
        $scope.confirm = true;
        $scope.confirmImmediateShutdown = true;
      };
    }
  ]);
})(angular);
