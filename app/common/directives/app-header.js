window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('appHeader', ['APIUtils', function (APIUtils) {
            return {
                'restrict': 'E',
                'templateUrl': 'common/directives/app-header.html',
                'scope': {
                   'path': '='
                },
                'controller': ['$rootScope', '$scope','dataService', 'userModel', '$location', function($rootScope, $scope, dataService, userModel, $location){
                    $scope.dataService = dataService;

                    $scope.loadServerStatus = function(){
                        if(!userModel.isLoggedIn()){
                            return;
                        }
                        APIUtils.getHostState(function(status){
                            if(status == 'xyz.openbmc_project.State.Host.HostState.Off'){
                                dataService.setPowerOffState();
                            }else if(status == 'xyz.openbmc_project.State.Host.HostState.Running'){
                                dataService.setPowerOnState();
                            }else{
                                dataService.setBootingState();
                            }
                        });
                    }

                    $scope.loadNetworkInfo = function(){
                        if(!userModel.isLoggedIn()){
                            return;
                        }
                        APIUtils.getNetworkInfo().then(function(data){
                            dataService.setNetworkInfo(data);
                        });
                    }

                    $scope.loadServerStatus();
                    $scope.loadNetworkInfo();

                    $scope.logout = function(){
                        userModel.logout(function(status, error){
                            if(status){
                               $location.path('/logout');
                            }else{
                                console.log(error);
                            }
                        });
                    }

                    $scope.refresh = function(){
                        $scope.loadServerStatus();
                        $scope.loadNetworkInfo();

                        //Add flash class to header timestamp on click of refresh
                        var myEl = angular.element( document.querySelector( '.header__refresh' ) );
                        myEl.addClass('flash');
                        setTimeout(function () {
                            myEl.removeClass("flash");
                        },2000);

                    }

                    var loginListener = $rootScope.$on('user-logged-in', function(event, arg){
                        $scope.loadServerStatus();
                        $scope.loadNetworkInfo();
                    });

                    $scope.$on('$destroy', function(){
                        loginListener();
                    });
                }]
            };
        }]);
})(window.angular);
