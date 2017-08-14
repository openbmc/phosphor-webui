window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('logEvent', ['APIUtils', function (APIUtils) {
            return {
                'restrict': 'E',
                'templateUrl': 'common/directives/log-event.html',
                'scope': {
                   'event': '=',
                   'tmz': '=',
                   'multiSelected': '='
                },
                'controller': ['$rootScope', '$scope','dataService', '$location', '$timeout', function($rootScope, $scope, dataService, $location, $timeout){
                    $scope.dataService = dataService;
                    $scope.copySuccess = function (event) {
                        event.copied = true;
                        $timeout(function(){
                            event.copied = false;
                        }, 5000);
                    };
                    $scope.copyFailed = function (err) {
                        console.error('Error!', err);
                    };
                    $scope.resolveEvent = function(event){
                        APIUtils.resolveLogs([{Id: event.Id}]).then(function(){
                            event.Resolved = 1;
                        });
                    }

                    $scope.accept = function(){
                        $scope.event.selected = true;
                        $timeout(function(){
                            $scope.$parent.accept();
                        }, 10);
                    }
                }]
            };
        }]);
})(window.angular);
