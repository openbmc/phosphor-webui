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
      $scope.power_confirm = false;
      $scope.warmboot_confirm = false;
      $scope.coldboot_confirm = false;
      $scope.orderly_confirm = false;
      $scope.immediately_confirm = false;
      $scope.loading = true;

      var pollChassisStatusTimer = undefined;
      var pollStartTime = null;
      APIUtils.getForceToBIOSState().then(
          function(data) {
            if (data == APIUtils.FORCE_TO_BIOS_STATE_TEXT.on) {
              dataService.ForceToBIOS_state =
                  APIUtils.FORCE_TO_BIOS_STATE_TEXT.on;
            } else {
              dataService.ForceToBIOS_state =
                  APIUtils.FORCE_TO_BIOS_STATE_TEXT.off;
            }
          },
          function(error) {
            console.log(JSON.stringify(error));
          });

      //@TODO: call api and get proper state

      APIUtils.getLastPowerTime()
          .then(
              function(data) {
                if (data.data == 0) {
                  $scope.power_time = 'not available';
                } else {
                  $scope.power_time = data.data;
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

      $scope.toggleForceToBIOS = function() {
        var toggleState = (dataService.ForceToBIOS_state ==
                           APIUtils.FORCE_TO_BIOS_STATE_TEXT.on) ?
            APIUtils.FORCE_TO_BIOS_STATE_TEXT.off :
            APIUtils.FORCE_TO_BIOS_STATE_TEXT.on;
        dataService.ForceToBIOS_state = (dataService.ForceToBIOS_state ==
                                         APIUtils.FORCE_TO_BIOS_STATE_TEXT.on) ?
            APIUtils.FORCE_TO_BIOS_STATE_TEXT.off :
            APIUtils.FORCE_TO_BIOS_STATE_TEXT.on;
        APIUtils.setForceToBIOSState(toggleState)
            .then(
                function(response) {
                  console.log('Set/Reset the Boot to BIOS successful.');
                },
                function(errors) {
                  toastService.error('Failed to set Boot to BIOS ');
                  console.log(JSON.stringify(errors));
                })
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
      $scope.powerOnConfirm = function() {
        if ($scope.confirm) {
          return;
        }
        $scope.confirm = true;
        $scope.power_confirm = true;
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
      $scope.testState = function() {
        $timeout(function() {
          dataService.setPowerOffState();
          $timeout(function() {
            dataService.setPowerOnState();
          }, 2000);
        }, 1000);
      };
      $scope.warmRebootConfirm = function() {
        if ($scope.confirm) {
          return;
        }
        $scope.confirm = true;
        $scope.warmboot_confirm = true;
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
        $scope.coldboot_confirm = true;
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
        $scope.orderly_confirm = true;
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
        $scope.immediately_confirm = true;
      };
    }
  ]);
})(angular);
