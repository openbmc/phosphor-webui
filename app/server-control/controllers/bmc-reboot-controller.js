/**
 * Controller for bmc-reboot
 *
 * @module app/serverControl
 * @exports bmcRebootController
 * @name bmcRebootController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('bmcRebootController', [
    '$scope', '$window', 'APIUtils', 'dataService', 'toastService',
    function($scope, $window, APIUtils, dataService, toastService) {
      $scope.dataService = dataService;
      $scope.confirm = false;
      APIUtils.getLastRebootCause().then(
          function(status) {
            if (status ==
                'xyz.openbmc_project.State.BMC.RebootCause.POR') {
              $scope.reboot_cause = 'Power-On-Reset';
            } else if (
                status ==
                'xyz.openbmc_project.State.BMC.RebootCause.Watchdog') {
              $scope.reboot_cause = 'Watchdog';
            } else {
              $scope.reboot_cause = 'Unknown';
            }
          },
          function(error) {
            console.log(error);
          });
      APIUtils.getLastRebootTime().then(
          function(data) {
            $scope.reboot_time = data.data;
          },
          function(error) {
            console.log(JSON.stringify(error));
          });
      $scope.rebootConfirm = function() {
        if ($scope.confirm) {
          return;
        }
        $scope.confirm = true;
      };
      $scope.reboot = function() {
        APIUtils.bmcReboot().then(
            function(response) {
              toastService.success('BMC is rebooting.')
            },
            function(error) {
              console.log(JSON.stringify(error));
              toastService.error('Unable to reboot BMC.');
            });
      };
    }
  ]);
})(angular);
