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
      $scope.fullSensorsInfo = [];
      $scope.selectedComponent = {};
      $scope.showThresholds = true;  // TODO: add button to toggle this..
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
        $scope.showCompDropdown = false;
        if (index == -1) {
          // Flattened sensor data to display all sensors.
          $scope.selectedComponent = {'Name': 'All'};
          $scope.sensorsInfo = {'Temperatures': [], 'Fans': [], 'Voltages': []};
          angular.forEach($scope.fullSensorsInfo, function(record) {
            $scope.sensorsInfo.Temperatures = [].concat(
                $scope.sensorsInfo.Temperatures, record.sensors.Temperatures);
            $scope.sensorsInfo.Fans =
                [].concat($scope.sensorsInfo.Fans, record.sensors.Fans);
            $scope.sensorsInfo.Voltages =
                [].concat($scope.sensorsInfo.Voltages, record.sensors.Voltages);
          });
        } else {
          $scope.selectedComponent = $scope.fullSensorsInfo[index];
          $scope.sensorsInfo = $scope.selectedComponent['sensors'];
        }
        $scope.loading = false;
      };

      function getComponentSensors(component) {
        var data = component;
        data['sensors'] = {'Temperatures': [], 'Fans': [], 'Voltages': []};
        APIUtils.getSensorsInfo(component.Thermal['@odata.id'])
            .then(function(res) {
              if (res.hasOwnProperty('Temperatures')) {
                data.sensors['Temperatures'] = res.Temperatures;
              }
              if (res.hasOwnProperty('Fans')) {
                data.sensors['Fans'] = res.Fans;
              }
              return;
            });
        APIUtils.getSensorsInfo(component.Power['@odata.id'])
            .then(function(res) {
              if (res.hasOwnProperty('Voltages')) {
                data.sensors['Voltages'] = res.Voltages;
              }
              return;
            });
        return data;
      };

      $scope.loadSensorData = function() {
        $scope.loading = true;
        APIUtils.getAllChassisCollection()
            .then(
                function(chassisList) {
                  angular.forEach(chassisList, function(chassis) {
                    var resData = getComponentSensors(chassis);
                    $scope.fullSensorsInfo.push(resData);
                  });
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.selectComponent(0);
              $scope.loading = false;
            });
      };

      if (dataService.configJson.redfishSupportEnabled == true) {
        $scope.loadSensorData();
      } else {
        // Non-REDFISH: This will be removed in future.
        // Hardcoded: REST API gets full sensors in single
        // request(dbus). Component is hardcoded and full data
        // is fetched at the beginning.
        var data = {'Name': 'Chassis'};
        data['sensors'] = {'Temperatures': [], 'Fans': [], 'Voltages': []};
        $scope.loading = true;

        APIUtils.getAllSensorsInfo()
            .then(
                function(res) {
                  data['sensors'] = res;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                })
            .finally(function() {
              $scope.fullSensorsInfo.push(data);
              $scope.selectComponent(0);
              $scope.loading = false;
            });
      }
    }
  ]);
})(angular);
