/**
 * Controller for sensors-overview
 *
 * @module app/serverHealth
 * @exports sensorsOverviewController
 * @name sensorsOverviewController
 */

window.angular && (function(angular) {
  'use strict';
  angular.module('app.overview').controller('sensorsOverviewController', [
    '$scope', '$q', '$window', 'APIUtils', 'dataService', 'Constants',
    function($scope, $q, $window, APIUtils, dataService, Constants) {
      $scope.dataService = dataService;

      $scope.loading = false;
      $scope.componentList = [];
      $scope.sensorsInfo = {};
      $scope.selectedComponent = {};
      $scope.showThresholds = true;  // TODO: add button to toggle this..
      $scope.totalSensors = 0;
      $scope.showCompDropdown = false;
      $scope.customSearch = '';
      $scope.searchTerms = [];
      $scope.messages = Constants.MESSAGES.SENSOR;
      $scope.filteredVoltSensors = [];
      $scope.filteredTempSensors = [];
      $scope.filteredFanSensors = [];

      $scope.selectedSeverity =
          {all: true, ok: false, warning: false, critical: false};
      $scope.export_name = 'sensors.json';

      $scope.clear = function() {
        $scope.customSearch = '';
        $scope.searchTerms = [];
      };

      $scope.doSearchOnEnter = function(event) {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (event.keyCode === 13 && search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.doSearchOnClick = function() {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.toggleSeverityAll = function() {
        $scope.selectedSeverity.all = !$scope.selectedSeverity.all;

        if ($scope.selectedSeverity.all) {
          $scope.selectedSeverity.ok = false;
          $scope.selectedSeverity.warning = false;
          $scope.selectedSeverity.critical = false;
        }
      };

      $scope.toggleSeverity = function(severity) {
        $scope.selectedSeverity[severity] = !$scope.selectedSeverity[severity];

        if (['ok', 'warning', 'critical'].indexOf(severity) > -1) {
          if ($scope.selectedSeverity[severity] == false &&
              (!$scope.selectedSeverity.ok &&
               !$scope.selectedSeverity.warning &&
               !$scope.selectedSeverity.critical)) {
            $scope.selectedSeverity.all = true;
            return;
          }
        }

        if ($scope.selectedSeverity.ok && $scope.selectedSeverity.warning &&
            $scope.selectedSeverity.critical) {
          $scope.selectedSeverity.all = true;
          $scope.selectedSeverity.ok = false;
          $scope.selectedSeverity.warning = false;
          $scope.selectedSeverity.critical = false;
        } else {
          $scope.selectedSeverity.all = false;
        }
      };

      $scope.filterBySeverity = function(sensor) {
        if ($scope.selectedSeverity.all) return true;

        return (
            ((sensor.Status.Health == 'OK') && $scope.selectedSeverity.ok) ||
            ((sensor.Status.Health == 'Warning') &&
             $scope.selectedSeverity.warning) ||
            ((sensor.Status.Health == 'Critical') &&
             $scope.selectedSeverity.critical));
      };
      $scope.filterBySearchTerms = function(sensor) {
        if (!$scope.searchTerms.length) return true;

        for (var i = 0, length = $scope.searchTerms.length; i < length; i++) {
          // TODO: Form it while getting data
          var search_text = sensor.Name.toLowerCase();
          if (search_text.indexOf($scope.searchTerms[i].toLowerCase()) == -1)
            return false;
        }
        return true;
      };

      $scope.selectComponent = function(index) {
        $scope.loading = true;
        $scope.totalSensors = 0;
        $scope.showCompDropdown = false;
        $scope.selectedComponent = $scope.componentList[index];
        $q.all([
            APIUtils
                .getSensorsInfo($scope.selectedComponent.Thermal['@odata.id'])
                .then(
                    function(res) {
                      $scope.sensorsInfo = res;
                      if (res.hasOwnProperty('Temperatures')) {
                        $scope.totalSensors += res.Temperatures.length;
                      } else {
                        $scope.sensorsInfo['Temperatures'] = [];
                      }
                      if (res.hasOwnProperty('Fans')) {
                        $scope.totalSensors += res.Fans.length;
                      } else {
                        $scope.sensorsInfo['Fans'] = [];
                      }
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                    }),
            APIUtils.getSensorsInfo($scope.selectedComponent.Power['@odata.id'])
                .then(
                    function(res) {
                      if (res.hasOwnProperty('Voltages')) {
                        $scope.sensorsInfo['Voltages'] = res.Voltages;
                        $scope.totalSensors += res.Voltages.length;
                      } else {
                        $scope.sensorsInfo['Voltages'] = [];
                      }
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                    })
          ]).finally(function() {
          $scope.loading = false;
        });
      };

      $scope.loadSensorData = function() {
        $scope.loading = true;
        APIUtils.getAllChassisCollection()
            .then(
                function(res) {
                  $scope.componentList = res;
                  $scope.selectComponent(0);
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.loading = false;
            });
      };

      if (dataService.configJson.redfishSupportEnabled == true) {
        $scope.loadSensorData();
      } else {
        // Non-REDFISH: This will be removed in future.
        // Hardcoded: REST API gets full sensors in single
        // request(dbus). Component is hardcoded and full data
        // is fetched at the begenning.
        $scope.selectedComponent = {'Name': 'Chassis'};
        $scope.componentList.push($scope.selectedComponent);

        $scope.loading = true;
        APIUtils.getAllSensorsInfo()
            .then(
                function(res) {
                  $scope.sensorsInfo = res;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.loading = false;
            });
      }
    }
  ]);
})(angular);
