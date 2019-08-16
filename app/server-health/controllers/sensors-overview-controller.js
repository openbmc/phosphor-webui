import {_} from 'core-js';

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
    '$scope', '$q', '$window', '$filter', 'APIUtils', 'toastService',
    'dataService', 'Constants',
    function(
        $scope, $q, $window, $filter, APIUtils, toastService, dataService,
        Constants) {
      $scope.dataService = dataService;
      $scope.dropdown_selected = false;

      $scope.loading = true;
      $scope.sensorsInfo = {};
      $scope.fullSensorsInfo = [];
      $scope.showThresholds = false;
      $scope.customSearch = '';
      $scope.searchTerms = [];
      $scope.messages = Constants.MESSAGES.SENSOR;
      $scope.selectedSeverity = 'all';
      $scope.severityList = ['All', 'Critical', 'Warning', 'Ok'];
      $scope.severes = 0;
      $scope.warnings = 0;
      $scope.suppressAlerts = false;
      $scope.sensorsInfo.Temperatures = [];
      $scope.sensorsInfo.Fans = [];
      $scope.sensorsInfo.Voltages = [];
      $scope.selectedChoice = 'All';
      $scope.reverseSeverity = false;
      $scope.reverse = false;
      $scope.keyname = 'Name';

      $scope.export_name = 'sensors.json';

      $scope.jsonData = function(data) {
        var dt = {};
        data.data.forEach(function(item) {
          dt[item.original_data.key] = item.original_data.value;
        });
        return JSON.stringify(dt);
      };

      $scope.showAlert = function() {
        var alertText = '';
        $scope.severes =
            $filter('filter')($scope.mergedSensors, 'critical').length;
        $scope.warnings =
            $filter('filter')($scope.mergedSensors, 'warning').length;

        if (($scope.severes > 0 || $scope.warnings > 0) &&
            !$scope.suppressAlerts) {
          if ($scope.severes) {
            alertText = $scope.severes;
            $scope.severes > 1 ? alertText = alertText + ' sensors' :
                                 alertText = alertText + ' sensor';
            alertText = alertText + ' at <b>critical</b> status level.<BR>';
          };
          if ($scope.warnings) {
            alertText = alertText + $scope.warnings;
            $scope.warnings > 1 ? alertText = alertText + ' sensors' :
                                  alertText = alertText + ' sensor';
            alertText = alertText + ' at <b>warning</b> status level.';
          };
          $scope.severes ? toastService.alert(alertText) :
                           toastService.warning(alertText);

          $scope.suppressAlerts = true;
        };
      };

      $scope.loadSensorData = function() {
        var i = 0;
        var chassisListTotal = 2;
        APIUtils.getAllChassisCollection().then(
            function(chassisList) {
              chassisListTotal = chassisList.length;
              angular.forEach(chassisList, function(chassis) {
                i = i + 1;
                var resData = getComponentSensors(chassis, chassisListTotal, i);
                $scope.fullSensorsInfo.push(resData);
              });
            },
            function(error) {
              console.log(JSON.stringify(error));
            });
      };

      function getComponentSensors(component, totalChassis, curChassis) {
        var data = component;
        data['sensors'] = {'Temperatures': [], 'Fans': [], 'Voltages': []};

        APIUtils.getSensorsInfo(component.Power['@odata.id'])
            .then(function(res) {
              if (res.hasOwnProperty('Voltages')) {
                data.sensors['Voltages'] = res.Voltages;
              }
              APIUtils.getSensorsInfo(component.Thermal['@odata.id'])
                  .then(function(res) {
                    if (res.hasOwnProperty('Temperatures')) {
                      data.sensors['Temperatures'] = res.Temperatures;
                    }
                    if (res.hasOwnProperty('Fans')) {
                      data.sensors['Fans'] = res.Fans;
                    }
                    return;
                  })
                  .finally(function() {
                    if (curChassis == totalChassis) {
                      $scope.loading = false;

                      // Prepare Export file
                      $scope.loadMergedSensors().then(function() {
                        $scope.showAlert();
                        $scope.mergedsensorsexport =
                            ((JSON.stringify($scope.sensorsInfo.Voltages.concat(
                                  $scope.sensorsInfo.Fans,
                                  $scope.sensorsInfo.Temperatures)))
                                 .replace('[', ''))
                                .replace(']', '');
                        // encode # ins export
                        var i = 0;
                        var strLength = $scope.mergedsensorsexport.length;
                        for (i; i < strLength; i++) {
                          $scope.mergedsensorsexport =
                              $scope.mergedsensorsexport.replace('#', '%23');
                        };
                      });
                    };
                  });
              return;
            })

        return data;
      };

      $scope.loadMergedSensors = function() {
        var deferred = $q.defer();
        // Flattened sensor data to display all sensors
        // Looping through all chassis collections to flatten sensors data
        angular.forEach($scope.fullSensorsInfo, function(record) {
          $scope.sensorsInfo.Temperatures = [].concat(
              $scope.sensorsInfo.Temperatures, record.sensors.Temperatures);
          $scope.sensorsInfo.Fans =
              [].concat($scope.sensorsInfo.Fans, record.sensors.Fans);
          $scope.sensorsInfo.Voltages =
              [].concat($scope.sensorsInfo.Voltages, record.sensors.Voltages);
        });

        $scope.mergedSensors = $scope.sensorsInfo.Voltages.concat(
            $scope.sensorsInfo.Fans, $scope.sensorsInfo.Temperatures);
        deferred.resolve($scope.mergedSensors);
        return deferred.promise;
      };

      $scope.clear = function() {
        $scope.customSearch = '';
        $scope.searchTerms = [];
      };

      $scope.doSearchOnEnter = function(event) {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (event.keyCode === 13 && search.length >= 1) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else if (search.length == 1) {
          $scope.searchTerms = search;
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.showReadingUnits = function(
          reading, readingVolts, readingCelsius, readingUnits) {
        var readings = [reading, readingVolts, readingCelsius];
        for (var i = 0; i < readings.length; i++) {
          if (readings[i]) {
            return $filter('number')(readings[i], 2) +
                $scope.getReadingUnits(
                    readingVolts, readingCelsius, readingUnits);
          };
        };
      };

      $scope.getReadingUnits = function(
          readingVolts, readingCelsius, readingUnits) {
        var sStr = '';
        if (readingVolts) {
          sStr = sStr + 'V';
        };

        if (readingCelsius) {
          sStr = sStr + '\xB0' +
              ' C';
        };
        if (readingUnits) {
          sStr = readingUnits.replace('Percent', '%');
        }
        return sStr;
      };

      $scope.doSearchOnClick = function() {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else if (search.length == 1) {
          $scope.searchTerms = search;
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.filterBySeverity = function(sensor) {
        if ($scope.selectedSeverity == 'all') return true;
        return (
            ((sensor.Status.Health == 'OK') &&
             ($scope.selectedSeverity == 'ok')) ||
            ((sensor.Status.Health == 'Warning') &&
             $scope.selectedSeverity == 'warning') ||
            ((sensor.Status.Health == 'Critical') &&
             $scope.selectedSeverity == 'critical'));
      };

      $scope.filterBySearchTerms = function(sensor) {
        if (!$scope.searchTerms.length) return true;
        for (var i = 0, length = $scope.searchTerms.length; i < length; i++) {
          var search_text = sensor.Name.toLowerCase();
          if (search_text.indexOf($scope.searchTerms[i].toLowerCase()) == -1)
            return false;
        }
        return true;
      };

      $scope.sortBy = function(keyname) {
        $scope.reverse = (keyname !== null && $scope.keyname === keyname) ?
            !$scope.reverse :
            false;
        $scope.keyname = keyname;
        $scope.sortKey = keyname;
      };

      $scope.sortBySeverity = function() {
        $scope.reverseSeverity = !$scope.reverseSeverity;
        $scope.sortKey = true;
        $scope.orderDatabySeverity();
      };

      $scope.toggleSeverity = function(severity) {
        severity = $filter('lowercase')(severity);
        $scope.selectedSeverity = severity;
      };

      $scope.orderDatabySeverity = function(val) {
        if (val) {
          if ($scope.reverseSeverity) {
            return ['Critical', 'Warning', 'OK'].indexOf(val.Status.Health);
          } else {
            return ['Ok', 'Warning', 'Critical'].indexOf(val.Status.Health);
          }
        }
      };

      $scope.selectComponent = function(val) {
        if (val == 'All') {
          $scope.filterByComponent = '';
        } else {
          $scope.filterByComponent = val;
        }
      };

      $scope.loadSensorData();
    }
  ]);
})(angular);