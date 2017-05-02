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
    var sensorData = [], originalData = {};
    angular
        .module('app.overview')
        .controller('sensorsOverviewController', [
            '$scope',
            '$log',
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $log, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;

                $scope.dropdown_selected = false;

                $scope.$log = $log;
                $scope.customSearch = "";
                $scope.searchTerms = [];
                $scope.selectedSeverity = {
                    all: true,
                    normal: false,
                    warning: false,
                    critical: false
                };
                $scope.export_name = "sensors.json";
                $scope.jsonData = function(data){
                    var dt = {};
                    data.data.forEach(function(item){
                        dt[item.original_data.key] = item.original_data.value;
                    });
                    return JSON.stringify(dt);
                };

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
                        $scope.selectedSeverity.normal = false;
                        $scope.selectedSeverity.warning = false;
                        $scope.selectedSeverity.critical = false;
                    }
                }

                $scope.toggleSeverity = function(severity){
                    $scope.selectedSeverity[severity] = !$scope.selectedSeverity[severity];

                    if($scope.selectedSeverity.normal && 
                       $scope.selectedSeverity.warning && 
                       $scope.selectedSeverity.critical){
                        $scope.selectedSeverity.all = true;
                        $scope.selectedSeverity.normal = false;
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

                $scope.loadSensorData = function(){
                    APIUtils.getAllSensorStatus(function(data, originalData){
                        sensorData = data;
                        originalData = originalData;
                        $scope.data = data;
                        $scope.originalData = originalData;
                        dataService.sensorData = sensorData;
                        $scope.export_data = JSON.stringify(originalData);
                    });
                };

                $scope.loadSensorData();
            }
        ]
    );

})(angular);