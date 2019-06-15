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
        '$interval',
        '$q',
        'toastService',
        function(
          $scope,
          APIUtils,
          dataService,
          Constants,
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

          // When a power operation is in progress, set to true,
          // when a power operation completes (success/fail) set to false.
          // This property is used to show/hide the 'in progress' message
          // in markup.
          $scope.operationPending = false;

          /**
           * Checks the host status provided by the dataService using an
           * interval timer
           * @param {string} statusType : host status type to check for
           * @param {number} timeout : timeout limit, defaults to 5 minutes
           * @param {string} error : error message, defaults to 'Time out'
           * @return {Promise} : returns a deferred promise that will be fulfilled
           * if the status is met or be rejected if the timeout is reached
           */
          var checkHostStatus = (
            statusType,
            timeout = 300000,
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

          /**
           * Initiate Power on
           */
          $scope.powerOn = () => {
            $scope.operationPending = true;
            dataService.setUnreachableState();
            APIUtils.hostPowerOn()
              .then(() => {
                // Check for on state
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.on,
                  Constants.TIMEOUT.HOST_ON,
                  Constants.MESSAGES.POLL.HOST_ON_TIMEOUT
                );
              })
              .catch(error => {
                console.log(error);
                toastService.error(Constants.MESSAGES.POWER_OP.POWER_ON_FAILED);
              })
              .finally(() => {
                $scope.operationPending = false;
              });
          };

          /**
           * Initiate Orderly reboot
           * Attempts to stop all software
           */
          $scope.warmReboot = () => {
            $scope.operationPending = true;
            dataService.setUnreachableState();
            APIUtils.hostReboot()
              .then(() => {
                // Check for off state
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.off,
                  Constants.TIMEOUT.HOST_OFF,
                  Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT
                );
              })
              .then(() => {
                // Check for on state
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.on,
                  Constants.TIMEOUT.HOST_ON,
                  Constants.MESSAGES.POLL.HOST_ON_TIMEOUT
                );
              })
              .catch(error => {
                console.log(error);
                toastService.error(
                  Constants.MESSAGES.POWER_OP.WARM_REBOOT_FAILED
                );
              })
              .finally(() => {
                $scope.operationPending = false;
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

          /**
           * Initiate Immediate reboot
           * Does not attempt to stop all software
           */
          $scope.coldReboot = () => {
            $scope.operationPending = true;
            dataService.setUnreachableState();
            APIUtils.chassisPowerOff()
              .then(() => {
                // Check for off state
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.off,
                  Constants.TIMEOUT.HOST_OFF_IMMEDIATE,
                  Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT
                );
              })
              .then(() => {
                return APIUtils.hostPowerOn();
              })
              .then(() => {
                // Check for on state
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.on,
                  Constants.TIMEOUT.HOST_ON,
                  Constants.MESSAGES.POLL.HOST_ON_TIMEOUT
                );
              })
              .catch(error => {
                console.log(error);
                toastService.error(
                  Constants.MESSAGES.POWER_OP.COLD_REBOOT_FAILED
                );
              })
              .finally(() => {
                $scope.operationPending = false;
              });
          };

          $scope.coldRebootConfirm = function() {
            if ($scope.confirm) {
              return;
            }
            $scope.confirm = true;
            $scope.confirmColdReboot = true;
          };

          /**
           * Initiate Orderly shutdown
           * Attempts to stop all software
           */
          $scope.orderlyShutdown = () => {
            $scope.operationPending = true;
            dataService.setUnreachableState();
            APIUtils.hostPowerOff()
              .then(() => {
                // Check for off state
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.off,
                  Constants.TIMEOUT.HOST_OFF,
                  Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT
                );
              })
              .catch(error => {
                console.log(error);
                toastService.error(
                  Constants.MESSAGES.POWER_OP.ORDERLY_SHUTDOWN_FAILED
                );
              })
              .finally(() => {
                $scope.operationPending = false;
              });
          };

          $scope.orderlyShutdownConfirm = function() {
            if ($scope.confirm) {
              return;
            }
            $scope.confirm = true;
            $scope.confirmOrderlyShutdown = true;
          };

          /**
           * Initiate Immediate shutdown
           * Does not attempt to stop all software
           */
          $scope.immediateShutdown = () => {
            $scope.operationPending = true;
            dataService.setUnreachableState();
            APIUtils.chassisPowerOff()
              .then(() => {
                // Check for off state
                return checkHostStatus(
                  Constants.HOST_STATE_TEXT.off,
                  Constants.TIMEOUT.HOST_OFF_IMMEDIATE,
                  Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT
                );
              })
              .then(() => {
                dataService.setPowerOffState();
              })
              .catch(error => {
                console.log(error);
                toastService.error(
                  Constants.MESSAGES.POWER_OP.IMMEDIATE_SHUTDOWN_FAILED
                );
              })
              .finally(() => {
                $scope.operationPending = false;
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
