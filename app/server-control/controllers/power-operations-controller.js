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
    '$interpolate', '$q',
    function(
        $scope, APIUtils, dataService, Constants, $timeout, $interval,
        $interpolate, $q) {
      $scope.dataService = dataService;
      $scope.confirm = false;
      $scope.power_confirm = false;
      $scope.warmboot_confirm = false;
      $scope.coldboot_confirm = false;
      $scope.orderly_confirm = false;
      $scope.immediately_confirm = false;
      $scope.loading = false;

      var pollChassisStatusTimer = undefined;
      var pollHostStatusTimer = undefined;
      var pollStartTime = null;

      //@TODO: call api and get proper state
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
              pollStartTime = new Date();
              return pollHostStatusTillOn();
            })
            .then(function(hostState) {
              $scope.loading = false;
            })
            .catch(function(error) {
              dataService.activateErrorModal({
                title: Constants.MESSAGES.POWER_OP.POWER_ON_FAILED,
                description: error.statusText ?
                    $interpolate(
                        Constants.MESSAGES.ERROR_MESSAGE_DESC_TEMPLATE)(
                        {status: error.status, description: error.statusText}) :
                    error
              });
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

      function pollHostStatusTillOn() {
        var deferred = $q.defer();
        pollHostStatusTimer = $interval(function() {
          var now = new Date();
          if ((now.getTime() - pollStartTime.getTime()) >=
              Constants.TIMEOUT.HOST_ON) {
            $interval.cancel(pollHostStatusTimer);
            pollHostStatusTimer = undefined;
            deferred.reject(new Error(Constants.MESSAGES.POLL.HOST_ON_TIMEOUT));
          }
          APIUtils.getHostState()
              .then(function(state) {
                if (state === Constants.HOST_STATE_TEXT.on_code) {
                  $interval.cancel(pollHostStatusTimer);
                  pollHostStatusTimer = undefined;
                  deferred.resolve(state);
                } else if (state === Constants.HOST_STATE_TEXT.error_code) {
                  $interval.cancel(pollHostStatusTimer);
                  pollHostStatusTimer = undefined;
                  deferred.reject(
                      new Error(Constants.MESSAGES.POLL.HOST_QUIESCED));
                }
              })
              .catch(function(error) {
                $interval.cancel(pollHostStatusTimer);
                pollHostStatusTimer = undefined;
                deferred.reject(error);
              });
        }, Constants.POLL_INTERVALS.POWER_OP);

        return deferred.promise;
      }

      function pollHostStatusTillOff() {
        var deferred = $q.defer();
        pollHostStatusTimer = $interval(function() {
          var now = new Date();
          if ((now.getTime() - pollStartTime.getTime()) >=
              Constants.TIMEOUT.HOST_OFF) {
            $interval.cancel(pollHostStatusTimer);
            pollHostStatusTimer = undefined;
            deferred.reject(
                new Error(Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT));
          }
          APIUtils.getHostState()
              .then(function(state) {
                if (state === Constants.HOST_STATE_TEXT.off_code) {
                  $interval.cancel(pollHostStatusTimer);
                  pollHostStatusTimer = undefined;
                  deferred.resolve(state);
                }
              })
              .catch(function(error) {
                $interval.cancel(pollHostStatusTimer);
                pollHostStatusTimer = undefined;
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
              pollStartTime = new Date();
              return pollHostStatusTillOff();
            })
            .then(function(hostState) {
              pollStartTime = new Date();
              return pollHostStatusTillOn();
            })
            .then(function(hostState) {
              $scope.loading = false;
            })
            .catch(function(error) {
              dataService.activateErrorModal({
                title: Constants.MESSAGES.POWER_OP.WARM_REBOOT_FAILED,
                description: error.statusText ?
                    $interpolate(
                        Constants.MESSAGES.ERROR_MESSAGE_DESC_TEMPLATE)(
                        {status: error.status, description: error.statusText}) :
                    error
              });
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
              pollStartTime = new Date();
              return pollHostStatusTillOn();
            })
            .then(function(state) {
              $scope.loading = false;
            })
            .catch(function(error) {
              dataService.activateErrorModal({
                title: Constants.MESSAGES.POWER_OP.COLD_REBOOT_FAILED,
                description: error.statusText ?
                    $interpolate(
                        Constants.MESSAGES.ERROR_MESSAGE_DESC_TEMPLATE)(
                        {status: error.status, description: error.statusText}) :
                    error
              });
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
              pollStartTime = new Date();
              return pollHostStatusTillOff();
            })
            .then(function(hostState) {
              pollStartTime = new Date();
              return pollChassisStatusTillOff();
            })
            .then(function(chassisState) {
              $scope.loading = false;
            })
            .catch(function(error) {
              dataService.activateErrorModal({
                title: Constants.MESSAGES.POWER_OP.ORDERLY_SHUTDOWN_FAILED,
                description: error.statusText ?
                    $interpolate(
                        Constants.MESSAGES.ERROR_MESSAGE_DESC_TEMPLATE)(
                        {status: error.status, description: error.statusText}) :
                    error
              });
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
              dataService.activateErrorModal({
                title: Constants.MESSAGES.POWER_OP.IMMEDIATE_SHUTDOWN_FAILED,
                description: error.statusText ?
                    $interpolate(
                        Constants.MESSAGES.ERROR_MESSAGE_DESC_TEMPLATE)(
                        {status: error.status, description: error.statusText}) :
                    error
              });
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
