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
<<<<<<< HEAD
                'controller': ['$scope', '$location', 'dataService', function($scope, $location, dataService){
                    $scope.dataService = dataService;
                    $scope.showSubMenu = false;
                    $scope.change = function(firstLevel){
                        if(firstLevel != $scope.firstLevel) {
                            $scope.firstLevel = firstLevel;
                            $scope.showSubMenu = true;
                        }else{
                           $scope.showSubMenu = !$scope.showSubMenu;
                        }
                    };
                    $scope.closeSubnav = function(){
                        $scope.showSubMenu = false;
                    };
                    $scope.$watch('path', function(){
                        var urlRoot = $location.path().split("/")[1];
                        if(urlRoot != ""){
                            $scope.firstLevel = urlRoot;
                        }else{
                            $scope.firstLevel = 'overview';
                        }
                        $scope.showSubMenu = false;
                    });
                    $scope.$watch('showNavigation', function(){
                        var paddingTop = 0;
                        var urlRoot = $location.path().split("/")[1];
                        if(urlRoot != ""){
                            $scope.firstLevel = urlRoot;
                        }else{
                            $scope.firstLevel = 'overview';
                        }

=======
                'controller': ['$scope', 'dataService', function($scope, dataService){
                    $scope.$watch('showNavigation', function(){
                        var paddingTop = 0;
                        $scope.firstLevel = 'overview';
                        $scope.secondLevel = 'system_overview';
>>>>>>> 4c1a3dd... Major update to code structure
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
