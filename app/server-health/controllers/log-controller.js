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
    angular
        .module('app.serverHealth')
        .controller('logController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            'Constants',
            '$routeParams',
            function($scope, $window, APIUtils, dataService, Constants, $routeParams){
                $scope.dataService = dataService;
                $scope.logs = [];
                $scope.tmz = 'EDT';
                $scope.itemsPerPage = Constants.PAGINATION.LOG_ITEMS_PER_PAGE;
                $scope.loading = false;

                var sensorType = $routeParams.type;

                // priority buttons
                $scope.selectedSeverity = {
                    all: true,
                    low: false,
                    medium: false,
                    high: false
                };

                if(sensorType == 'high'){
                    $scope.selectedSeverity.all = false;
                    $scope.selectedSeverity.high = true;
                }

                $scope.selectedStatus = {
                    all: true,
                    resolved: false
                };

                $scope.customSearch = "";
                $scope.searchItems = [];
                $scope.selectedEvents = [];

                $scope.loadLogs = function(){
                    $scope.loading = true;
                    APIUtils.getLogs().then(function(result){
                        $scope.logs = result.data;
                        $scope.originalData = result.original;
                        $scope.loading = false;
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


                $scope.accept = function(){
                    APIUtils.deleteLogs($scope.selectedEvents).then(function(){
                        $scope.confirm = false;
                        $scope.loadLogs();
                    });
                }

                $scope.resolve = function(){
                    var events = $scope.selectedEvents.filter(function(item){
                        return item.Resolved != 1;
                    });

                    if(!events.length) return;

                    APIUtils.resolveLogs(events).then(function(){
                        events.forEach(function(item){
                            item.Resolved = 1;
                        });
                    });
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
