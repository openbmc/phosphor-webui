/**
 * Controller for power-operations
 *
 * @module app/serverControl
 * @exports powerOperationsController
 * @name powerOperationsController
 */

window.angular &&
  (function(angular) {
    'use strict';

    angular
      .module('app.serverControl')
      .controller('powerOperationsController', [
        '$scope',
        'APIUtils',
        'dataService',
        'Constants',
        '$timeout',
        '$interval',
        '$q',
        'toastService',
        function(
          $scope,
          APIUtils,
          dataService,
          Constants,
          $timeout,
          $interval,
          $q,
          toastService
        ) {
          $scope.dataService = dataService;
          // Is a || of the other 4 "confirm" variables to ensure only
          // one confirm is shown at a time.
          $scope.confirm = false;
          $scope.confirmWarmReboot = false;
          $scope.confirmColdReboot = false;
          $scope.confirmOrderlyShutdown = false;
          $scope.confirmImmediateShutdown = false;
          $scope.loading = true;

          let pollChassisStatusTimer = undefined;
          let pollStartTime = null;

          /**
           * Checks the host status provided by the dataService using an
           * interval timer
           * @param {string} statusType : host status type to check for
           * @param {number} timeout : timeout limit
           * @param {string} error : error message
           * @return {Promise} : returns a deferred promise that will be fulfilled
           * if the status is met or be rejected if the timeout is reached
           */
          const checkHostStatus = (
            statusType,
            timeout,
            error = 'Time out.'
          ) => {
            const deferred = $q.defer();
            const start = new Date();
            const checkHostStatusInverval = $interval(() => {
              const now = new Date();
              const timePassed = now.getTime() - start.getTime();
              if (timePassed > timeout) {
                deferred.reject(error);
                $interval.cancel(checkHostStatusInverval);
              }
              if (dataService.server_state === statusType) {
                deferred.resolve();
                $interval.cancel(checkHostStatusInverval);
              }
            }, Constants.POLL_INTERVALS.POWER_OP);
            return deferred.promise;
          };

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
              }
            )
            .finally(function() {
              $scope.loading = false;
            });

          $scope.toggleState = function() {
            dataService.server_state =
              dataService.server_state == 'Running' ? 'Off' : 'Running';
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
            const deferred = $q.defer();
            pollChassisStatusTimer = $interval(function() {
              const now = new Date();
              if (
                now.getTime() - pollStartTime.getTime() >=
                Constants.TIMEOUT.CHASSIS_OFF
              ) {
                $interval.cancel(pollChassisStatusTimer);
                pollChassisStatusTimer = undefined;
                deferred.reject(
                  new Error(Constants.MESSAGES.POLL.CHASSIS_OFF_TIMEOUT)
                );
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
                  Constants.MESSAGES.POWER_OP.WARM_REBOOT_FAILED
                );
                $scope.loading = false;
              });
          };

          $scope.warmRebootConfirm = function() {
            if ($scope.confirm) {
              // If another "confirm" is already shown return
              return;
            }
            $scope.confirm = true;
            $scope.confirmWarmReboot = true;
          };

          $scope.coldReboot = function() {
            $scope.loading = true;
            dataService.setUnreachableState();
            APIUtils.chassisPowerOff()
              .then(function() {
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.off,
                  Constants.TIMEOUT.HOST_OFF_IMMEDIATE,
                  Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT
                );
              })
              .then(function() {
                return APIUtils.hostPowerOn();
              })
              .then(function() {
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.on,
                  Constants.TIMEOUT.HOST_ON,
                  Constants.MESSAGES.POLL.HOST_ON_TIMEOUT
                );
              })
              .catch(function(error) {
                console.log(error);
                toastService.error(
                  Constants.MESSAGES.POWER_OP.COLD_REBOOT_FAILED
                );
              })
              .finally(function() {
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
                  Constants.MESSAGES.POWER_OP.ORDERLY_SHUTDOWN_FAILED
                );
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
                  Constants.MESSAGES.POWER_OP.IMMEDIATE_SHUTDOWN_FAILED
                );
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
        },
      ]);
  })(angular);
