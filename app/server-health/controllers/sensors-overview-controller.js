/**
 * Controller for sensors-overview
 *
 * @module app/serverHealth
 * @exports sensorsOverviewController
 * @name sensorsOverviewController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';
    angular
        .module('app.overview')
        .controller('sensorsOverviewController', [
            '$scope',
            '$log',
            '$window',
            '$timeout',
            'APIUtils',
            'dataService',
            'Constants',
            function($scope, $log, $window, $timeout, APIUtils, dataService, Constants){
                $scope.dataService = dataService;

                $scope.dropdown_selected = false;

                $scope.$log = $log;
                $scope.customSearch = "";
                $scope.searchTerms = [];
                $scope.messages = Constants.MESSAGES.SENSOR;
                $scope.selectedSeverity = {
                    all: true,
                    normal: false,
                    warning: false,
                    critical: false
                };
                $scope.export_name = "sensors.json";
                $scope.loading = false;
                $scope.jsonData = function(data){
                    var dt = {};
                    data.data.forEach(function(item){
                        dt[item.original_data.key] = item.original_data.value;
                    });
                    return JSON.stringify(dt);
                };

                $scope.clear = function(){
                    $scope.customSearch = "";
                    $scope.searchTerms = [];
                }

                $scope.doSearchOnEnter = function (event) {
                    var search = $scope.customSearch.replace(/^\s+/g,'').replace(/\s+$/g,'');
                    if (event.keyCode === 13 &&
                        search.length >= 2) {
                        $scope.searchTerms = $scope.customSearch.split(" ");
                    }else{
                        if(search.length == 0){
                            $scope.searchTerms = [];
                        }
                    }
                };

                $scope.doSearchOnClick = function() {
                    var search = $scope.customSearch.replace(/^\s+/g,'').replace(/\s+$/g,'');
                    if (search.length >= 2) {
                        $scope.searchTerms = $scope.customSearch.split(" ");
                    }else{
                        if(search.length == 0){
                            $scope.searchTerms = [];
                        }
                    }
                }

                $scope.toggleSeverityAll = function(){
                    $scope.selectedSeverity.all = !$scope.selectedSeverity.all;

                    if($scope.selectedSeverity.all){
                        $scope.selectedSeverity.warning = false;
                        $scope.selectedSeverity.critical = false;
                    }
                }

                $scope.toggleSeverity = function(severity){
                    $scope.selectedSeverity[severity] = !$scope.selectedSeverity[severity];

                   if(['warning', 'critical'].indexOf(severity) > -1){
                       if($scope.selectedSeverity[severity] == false &&
                          (!$scope.selectedSeverity.warning &&
                           !$scope.selectedSeverity.critical
                          )){
                           $scope.selectedSeverity.all = true;
                           return;
                       }
                   }

                    if($scope.selectedSeverity.warning &&
                       $scope.selectedSeverity.critical){
                        $scope.selectedSeverity.all = true;
                        $scope.selectedSeverity.warning = false;
                        $scope.selectedSeverity.critical = false;
                    }else{
                        $scope.selectedSeverity.all = false;
                    }
                }

                $scope.filterBySeverity = function(sensor){
                    if($scope.selectedSeverity.all) return true;

                    return( (sensor.severity_flags.normal && $scope.selectedSeverity.normal) ||
                            (sensor.severity_flags.warning && $scope.selectedSeverity.warning) ||
                            (sensor.severity_flags.critical && $scope.selectedSeverity.critical)
                    );
                }
                $scope.filterBySearchTerms = function(sensor){

                    if(!$scope.searchTerms.length) return true;

                    for(var i = 0, length = $scope.searchTerms.length; i < length; i++){
                        if(sensor.search_text.indexOf($scope.searchTerms[i].toLowerCase()) == -1) return false;
                    }
                    return true;
                }

                $scope.sensorws = null;
                $scope.$on('$destroy', function() {
                    console.log('LEAVING SENSORS');
                    if ($scope.sensorws != null) {
                        console.log('Closing WebSocket');
                        $scope.sensorws.close();
                    }
                });
                $scope.loadSensorData = function(){
                    $scope.loading = true;
                    $scope.data = [];
                    $scope.sensorws = APIUtils.getAllSensorStatus(
                      function(data, originalData){
                        $scope.data.length = 0;
                        for (var key in data) { $scope.data.push(data[key]); }
                        $scope.originalData = originalData;
                        $scope.export_data = JSON.stringify(dataService.sensorData);
                        $scope.loading = false;
                        $timeout(angular.noop);
                      });
                };

                $scope.loadSensorData();
            }
        ]
     );

})(angular);
