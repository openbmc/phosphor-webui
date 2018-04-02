/**
 * Controller for server
 *
 * @module app/serverHealth
 * @exports inventoryOverviewController
 * @name inventoryOverviewController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverHealth')
        .controller('inventoryOverviewController', [
           '$rootScope',
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            function($rootScope, $scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
                $scope.hardwares = [];
                $scope.originalData = {};
                $scope.customSearch = "";
                $scope.searchTerms = [];
                $scope.loading = false;

                $scope.refreshHardwares = function(){
                    $scope.loading = true;
                    APIUtils.getHardwares(function(data, originalData){
                        $scope.hardwares = data;
                        $scope.originalData = JSON.stringify(originalData);
                        $scope.loading = false;
                    });
                }
                $scope.refreshHardwares();

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

                $scope.filterBySearchTerms = function(hardware){

                    if(!$scope.searchTerms.length) return true;

                    for(var i = 0, length = $scope.searchTerms.length; i < length; i++){
                        if(hardware.search_text.indexOf($scope.searchTerms[i].toLowerCase()) == -1) return false;
                    }
                    return true;
                }

                var refreshDataListener = $rootScope.$on('refresh-data', function(event, args) {
                    $scope.refreshHardwares();
                });

                $scope.$on('$destroy', function() {
                    refreshDataListener();
                });
            }
        ]
    );

})(angular);
