window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('firmwareList', ['APIUtils', function (APIUtils) {
            return {
                'restrict': 'E',
                'template': require('./firmware-list.html'),
                'scope': {
                   'title': '@',
                   'firmwares': '=',
                   'filterBy': '=',
                   'version': '='
                },
                'controller': ['$rootScope', '$scope','dataService', '$location', '$timeout', function($rootScope, $scope, dataService, $location, $timeout){
                    $scope.dataService = dataService;
                    $scope.activate = function(imageId){
                        $scope.$parent.activateImage(imageId);
                    }

                    $scope.delete = function(imageId){
                        $scope.$parent.deleteImage(imageId);
                    }

                    $scope.changePriority = function(imageId, imageVersion, from, to){
                        $scope.$parent.changePriority(imageId, imageVersion, from, to);
                    }
                }]
            };
        }]);
})(window.angular);
