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
    '$q', 'toastService', '$uibModal',
    function(
        $scope, APIUtils, dataService, Constants, $timeout, $interval, $q,
        toastService, $uibModal) {
      $scope.dataService = dataService;
      $scope.confirmWarmReboot = false;
      $scope.confirmColdReboot = false;
      $scope.confirmOrderlyShutdown = false;
      $scope.confirmImmediateShutdown = false;
      $scope.loading = false;
      $scope.oneTimeBootEnabled = false;
      $scope.bootSources = [];
      $scope.boot = {};
      $scope.defaultRebootSetting = 'warm-reboot';
      $scope.defaultShutdownSetting = 'warm-shutdown';

      $scope.activeModal;

      const modalTemplate = require('./power-operations-modal.html');

      const powerOperations = {
        WARM_REBOOT: 0,
        COLD_REBOOT: 1,
        WARM_SHUTDOWN: 2,
        COLD_SHUTDOWN: 3,
      };

      const closeModalCallback = function() {
        $scope.confirmOrderlyShutdown = false;
        $scope.confirmImmediateShutdown = false;
        $scope.confirmOrderlyReboot = false;
        $scope.confirmImmediateReboot = false;
        $scope.activeModal = undefined;
      };

      // Reboot operations
      const warmReboot = function() {
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

      const coldReboot = function() {
        $scope.loading = true;
        dataService.setUnreachableState();
        APIUtils.chassisPowerOff()
            .then(function() {
              return checkHostStatus(
                  Constants.HOST_STATE_TEXT.off,
                  Constants.TIMEOUT.HOST_OFF_IMMEDIATE,
                  Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT);
            })
            .then(function() {
              return APIUtils.hostPowerOn();
            })
            .then(function() {
              return checkHostStatus(
                  Constants.HOST_STATE_TEXT.on, Constants.TIMEOUT.HOST_ON,
                  Constants.MESSAGES.POLL.HOST_ON_TIMEOUT);
            })
            .catch(function(error) {
              console.log(error);
              toastService.error(
                  Constants.MESSAGES.POWER_OP.COLD_REBOOT_FAILED);
            })
            .finally(function() {
              $scope.loading = false;
            })
      };

      // Shutdown operations
      const orderlyShutdown = function() {
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

      const immediateShutdown = function() {
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
        $scope.confirmImmediateShutdown = false;
      };

      // Power operations modal
      $scope.initPowerOperation = function(powerOperation) {
        switch (powerOperation) {
          case powerOperations.WARM_REBOOT:
            warmReboot();
            break;
          case powerOperations.COLD_REBOOT:
            coldReboot();
            break;
          case powerOperations.WARM_SHUTDOWN:
            orderlyShutdown();
            break;
          case powerOperations.COLD_SHUTDOWN:
            immediateShutdown();
            break;
          default:
            // do nothing
        }
      };

      // Reboot operation selected
      $scope.updateRebootSetting = function(rebootSettingSelected) {
        $scope.defaultRebootSetting = rebootSettingSelected;
      };

      $scope.rebootConfirmModal = function() {
        if ($scope.defaultRebootSetting == 'warm-reboot') {
          $scope.confirmOrderlyReboot = true;
          $scope.activeModal = powerOperations.WARM_REBOOT;
        } else if ($scope.defaultRebootSetting == 'cold-reboot') {
          $scope.confirmImmediateReboot = true;
          $scope.activeModal = powerOperations.WARM_REBOOT;
        };

        $uibModal
            .open({
              template: modalTemplate,
              windowTopClass: 'uib-modal',
              scope: $scope,
              ariaLabelledBy: 'dialog_label'
            })
            .result
            .then(function() {
              closeModalCallback();
            })
            .catch(function() {
              closeModalCallback();
            });
      };

      // Shutdown operation selected
      $scope.updateShutdownSetting = function(shutdownSettingSelected) {
        $scope.defaultShutdownSetting = shutdownSettingSelected;
      };

      $scope.shutdownConfirmModal = function() {
        if ($scope.defaultShutdownSetting == 'warm-shutdown') {
          $scope.confirmOrderlyShutdown = true;
          $scope.activeModal = powerOperations.WARM_SHUTDOWN;
        } else if ($scope.defaultShutdownSetting == 'cold-shutdown') {
          $scope.confirmImmediateShutdown = true;
          $scope.activeModal = powerOperations.COLD_SHUTDOWN;
        };

        $uibModal
            .open({
              template: modalTemplate,
              windowTopClass: 'uib-modal',
              scope: $scope,
              ariaLabelledBy: 'dialog_label'
            })
            .result
            .then(function() {
              closeModalCallback();
            })
            .catch(function() {
              closeModalCallback();
            });
      };

      // Emitted every time the view is reloaded
      $scope.$on('$viewContentLoaded', function() {
        $scope.loadBootSettings();
        $scope.loadTPMStatus();
      });

      $scope.loadBootSettings = function() {
        APIUtils.getBootOptions()
            .then(function(response) {
              const boot = response.Boot;
              const BootSourceOverrideEnabled =
                  boot['BootSourceOverrideEnabled'];
              const BootSourceOverrideTarget = boot['BootSourceOverrideTarget'];
              const bootSourceValues =
                  boot['BootSourceOverrideTarget@Redfish.AllowableValues'];

              $scope.bootSources = bootSourceValues;

              $scope.boot = {
                'BootSourceOverrideEnabled': BootSourceOverrideEnabled,
                'BootSourceOverrideTarget': BootSourceOverrideTarget
              };
            })
            .catch(function(error) {
              console.log(
                  'Error loading boot settings:', JSON.stringify(error));
            });
        $scope.loading = false;
      };

      $scope.saveBootSettings = function() {
        let data = {};
        let Boot = {};
        data.Boot = Boot;

        if ($scope.boot.BootSourceOverrideTarget !== 'None' &&
            !$scope.boot.oneTimeBootEnabled) {
          Boot.BootSourceOverrideTarget = $scope.boot.BootSourceOverrideTarget;
          Boot.BootSourceOverrideEnabled = 'Continuous';
        } else if ($scope.boot.BootSourceOverrideTarget == 'None') {
          Boot.BootSourceOverrideTarget = $scope.boot.BootSourceOverrideTarget;
          Boot.BootSourceOverrideEnabled = 'Disabled';
        } else if ($scope.boot.oneTimeBootEnabled = true) {
          Boot.BootSourceOverrideTarget = $scope.boot.BootSourceOverrideTarget;
          Boot.BootSourceOverrideEnabled = 'Once';
        }

        APIUtils.saveBootSettings(data).then(
            function(response) {
              toastService.success('Successfully updated boot settings.');
            },
            function(error) {
              toastService.error('Unable to save boot settings.');
              console.log(JSON.stringify(error));
            });
      };

      $scope.loadTPMStatus = function() {
        APIUtils.getTPMStatus()
            .then(function(response) {
              const data = response.data;
              const TPMEnable = data;
              $scope.TPMToggle = TPMEnable;
            })
            .catch(function(error) {
              console.log('Error loading TPM status', JSON.stringify(error));
            });
        $scope.loading = false;
      };

      // Toggle TPM required policy
      $scope.enableTPM = function() {
        let data = {};

        if (!$scope.TPMToggle.TPMEnable) {
          data = true;
        } else {
          data = false;
        };

        APIUtils.saveTPMEnable(data).then(
            function(response) {
              toastService.success('Sucessfully updated TPM required policy.');
            },
            function(error) {
              toastService.error('Unable to update TPM required policy.');
              console.log(JSON.stringify(error));
            });
      };

      var pollChassisStatusTimer = undefined;
      var pollStartTime = null;
      /**
       * Checks the host status provided by the dataService using an
       * interval timer
       * @param {string} statusType : host status type to check for
       * @param {number} timeout : timeout limit
       * @param {string} error : error message
       * @returns {Promise} : returns a deferred promise that will be fulfilled
       * if the status is met or be rejected if the timeout is reached
       */
      var checkHostStatus = (statusType, timeout, error = 'Time out.') => {
        const deferred = $q.defer();
        const start = new Date();
        const checkHostStatusInverval = $interval(() => {
          let now = new Date();
          let timePassed = now.getTime() - start.getTime();
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
      };
    }
  ]);
})(angular);
