/**
 * Controller for systemOverview
 *
 * @module app/overview
 * @exports systemOverviewController
 * @name systemOverviewController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.overview').controller('systemOverviewController', [
    '$scope', '$window', 'APIUtils', 'dataService', '$q',
    function($scope, $window, APIUtils, dataService, $q) {
      $scope.dataService = dataService;
      $scope.dropdown_selected = false;
      $scope.tmz = 'EDT';
      $scope.logs = [];
      $scope.mac_address = '';
      $scope.bmc_info = {};
      $scope.server_info = {};
      $scope.bmc_firmware = '';
      $scope.bmc_time = '';
      $scope.server_firmware = '';
      $scope.power_consumption = '';
      $scope.power_cap = '';
      $scope.bmc_ip_addresses = [];
      $scope.loading = false;
      $scope.edit_server_name = false;

      loadOverviewData();
      function loadOverviewData() {
        $scope.loading = true;
        var promises = {
          logs: APIUtils.getLogs(),
          firmware: APIUtils.getFirmwares(),
          led: APIUtils.getLEDState(),
          ethernet: APIUtils.getBMCEthernetInfo(),
          bmc_info: APIUtils.getBMCInfo(),
          bmc_time: APIUtils.getBMCTime(),
          server_info: APIUtils.getServerInfo(),
          power_consumption: APIUtils.getPowerConsumption(),
          power_cap: APIUtils.getPowerCap(),
          network_info: APIUtils.getNetworkInfo(),
        };
        $q.all(promises)
            .then(function(data) {
              $scope.displayLogs(data.logs.data);
              $scope.displayServerInfo(
                  data.server_info, data.firmware.hostActiveVersion);
              $scope.displayLEDState(data.led);
              $scope.displayBMCEthernetInfo(data.ethernet);
              $scope.displayBMCInfo(
                  data.bmc_info, data.firmware.bmcActiveVersion);
              $scope.displayBMCTime(data.bmc_time);
              $scope.displayPowerConsumption(data.power_consumption);
              $scope.displayPowerCap(data.power_cap);
              $scope.displayNetworkInfo(data.network_info);
            })
            .finally(function() {
              $scope.loading = false;
            });
      }
      $scope.displayBMCEthernetInfo =
          function(data) {
        $scope.mac_address = data.MACAddress;
      }

          $scope.displayBMCInfo =
              function(data, bmcActiveVersion) {
        $scope.bmc_info = data;
        $scope.bmc_firmware = bmcActiveVersion;
      }

              $scope.displayBMCTime =
                  function(data) {
        $scope.bmc_time = data.data.Elapsed / 1000;
      }

                  $scope.displayLogs =
                      function(data) {
        $scope.logs = data.filter(function(log) {
          return log.severity_flags.high == true;
        });
      }

                      $scope.displayServerInfo =
                          function(data, hostActiveVersion) {
        $scope.server_info = data.data;
        $scope.server_firmware = hostActiveVersion;
      }

                          $scope.displayLEDState =
                              function(state) {
        if (state == APIUtils.LED_STATE.on) {
          dataService.LED_state = APIUtils.LED_STATE_TEXT.on;
        } else {
          dataService.LED_state = APIUtils.LED_STATE_TEXT.off;
        }
      }

                              $scope.toggleLED =
                                  function() {
        var toggleState =
            (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
            APIUtils.LED_STATE.off :
            APIUtils.LED_STATE.on;
        dataService.LED_state =
            (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
            APIUtils.LED_STATE_TEXT.off :
            APIUtils.LED_STATE_TEXT.on;
        APIUtils.setLEDState(toggleState, function(status) {});
      }

                                  $scope.displayPowerConsumption =
                                      function(data) {
        $scope.power_consumption = data;
      }

                                      $scope.displayPowerCap =
                                          function(data) {
        $scope.power_cap = data;
      }

                                          $scope.displayNetworkInfo =
                                              function(data) {
        // TODO: openbmc/openbmc#3150 Support IPV6 when officially
        // supported by the backend
        $scope.bmc_ip_addresses = data.formatted_data.ip_addresses.ipv4;
      }

                                              $scope.saveHostname = function(
                                                  hostname) {
        $scope.edit_server_name = false;
        $scope.loading = true;
        APIUtils.setHostname(hostname).then(
            function(data) {
              APIUtils.getNetworkInfo().then(function(data) {
                dataService.setNetworkInfo(data);
              });
            },
            function(error) {
              console.log(error);
            });
        $scope.loading = false;
      }
    }
  ]);

})(angular);
