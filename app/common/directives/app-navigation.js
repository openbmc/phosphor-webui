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
                'controller': ['$scope', '$location', 'dataService', function($scope, $location, dataService){
                    $scope.change = function(firstLevel){
                        $scope.firstLevel = firstLevel;
                        $location.path('/'+firstLevel);
                    }
                    $scope.$watch('showNavigation', function(){
                        var paddingTop = 0;
                        var urlRoot = $location.path().split("/")[1];
                        if(urlRoot != ""){
                            $scope.firstLevel = urlRoot;
                        }else{
                            $scope.firstLevel = 'overview';
                        }

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
