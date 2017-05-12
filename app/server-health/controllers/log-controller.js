/**
 * Controller for log
 *
 * @module app/serverHealth
 * @exports logController
 * @name logController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';
    var logData = [], originalData = {};
    angular
        .module('app.serverHealth')
        .controller('logController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            'Constants',
            function($scope, $window, APIUtils, dataService, Constants){
                $scope.dataService = dataService;
                $scope.logs = [];
                $scope.tmz = 'EDT';
                $scope.itemsPerPage = Constants.PAGINATION.LOG_ITEMS_PER_PAGE;
                // priority buttons
                $scope.selectedSeverity = {
                    all: true,
                    low: false,
                    medium: false,
                    high: false
                };
                $scope.selectedStatus = {
                    all: true,
                    resolved: false
                };

                $scope.customSearch = "";
                $scope.searchItems = [];
                $scope.selectedEvents = [];

                $scope.loadLogs = function(){
                    APIUtils.getLogs(function(data, originalData){
                        logData = data;
                        originalData = originalData;
                        $scope.logs = data;
                        $scope.originalData = originalData;
                    });
                };
                $scope.jsonData = function(data){
                    return JSON.stringify(data);
                };

                $scope.filterBySeverity = function(log){
                    if($scope.selectedSeverity.all) return true;

                    return( (log.severity_flags.low && $scope.selectedSeverity.low) ||
                            (log.severity_flags.medium && $scope.selectedSeverity.medium) ||
                            (log.severity_flags.high && $scope.selectedSeverity.high)
                    );
                }


                $scope.filterByStatus = function(log){
                    if ($scope.selectedStatus.all) return true;
                    return( (log.Resolved && $scope.selectedStatus.resolved)||
                            (!log.Resolved && !$scope.selectedStatus.resolved)
                    );
                }

                $scope.filterByDate = function(log){
                    if($scope.start_date && $scope.end_date){
                        var date = new Date(log.Timestamp);
                        return (date >= $scope.start_date &&
                               date <= $scope.end_date );
                    }else{
                        return true;
                    }
                }

                $scope.filterBySearchTerms = function(log){
                    if(!$scope.searchItems.length) return true; 

                    var flag = false;
                    for(var i = 0, length = $scope.searchItems.length; i < length; i++){
                        if(log.search_text.indexOf($scope.searchItems[i].toLowerCase()) == -1) return false;
                    }
                    return true;
                }

                $scope.addSearchItem = function(searchTerms){
                    var terms = searchTerms.split(" ");
                    terms.forEach(function(searchTerm){
                        if($scope.searchItems.indexOf(searchTerm) == -1){
                            $scope.searchItems.push(searchTerm);
                        }  
                    });
                }

                $scope.clearSearchItem = function(searchTerm){
                    $scope.searchItems = [];
                }

                $scope.removeSearchItem = function(searchTerm){
                    var termIndex = $scope.searchItems.indexOf(searchTerm);

                    if(termIndex > -1){
                        $scope.searchItems.splice(termIndex,1);
                    }
                }

                $scope.$watch('all', function(){
                    $scope.logs.forEach(function(item){
                        item.selected = $scope.all;
                    });
                });

                function updateExportData(){
                    $scope.export_name = ($scope.selectedEvents.length == 1) ? $scope.selectedEvents[0].Id + ".json" : "export.json";
                    var data = {};
                    $scope.selectedEvents.forEach(function(item){
                        data[item.data.key] = item.data.value;
                    });
                    $scope.export_data = JSON.stringify(data);
                }

                $scope.$watch('logs', function(){
                    $scope.selectedEvents = $scope.logs.filter(function(item){
                        return item.selected;
                    });
                    updateExportData();
                }, true);

                $scope.loadLogs();
            }
        ]
    );

})(angular);
