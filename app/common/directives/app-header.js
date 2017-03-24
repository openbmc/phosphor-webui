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
                            //@TODO:some error message?
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
                    $scope.loadServerStatus();

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
                    }

                    var loginListener = $rootScope.$on('user-logged-in', function(event, arg){
                        $scope.loadServerStatus();
                    });

                    $scope.$on('$destroy', function(){
                        loginListener();
                    });
                }]
            };
        }]);
})(window.angular);
