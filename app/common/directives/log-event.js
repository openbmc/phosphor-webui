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
                   'tmz': '='
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
                }]
            };
        }]);
})(window.angular);
