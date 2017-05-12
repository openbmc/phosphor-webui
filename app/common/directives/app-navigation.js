window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('appNavigation', function () {
            return {
                'restrict': 'E',
                'templateUrl': 'common/directives/app-navigation.html',
                'scope': {
                    'path': '=',
                    'showNavigation': '='
                },
                'controller': ['$scope', 'dataService', function($scope, dataService){
                    $scope.$watch('showNavigation', function(){
                        var paddingTop = 0;
                        $scope.firstLevel = 'overview';
                        $scope.secondLevel = 'system_overview';
                        if($scope.showNavigation){
                            paddingTop = document.getElementById('header__wrapper').offsetHeight;
                        }
                        dataService.bodyStyle = {'padding-top': paddingTop + 'px'};
                        $scope.navStyle = {'top': paddingTop + 'px'};
                    });
                }]
            };
        });
})(window.angular);
