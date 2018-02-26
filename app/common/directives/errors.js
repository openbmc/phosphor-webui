window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('errors', ['APIUtils', function (APIUtils) {
            return {
                'restrict': 'E',
                'template': require('./errors.html'),
                'scope': {
                   'path': '='
                },
                'controller': ['$scope','dataService', function($scope, dataService){
                    $scope.dataService = dataService;
                }]
            };
        }]);
})(window.angular);
