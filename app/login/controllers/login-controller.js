/**
 * Controller for the login page
 *
 * @module app/login/controllers/index
 * @exports LoginController
 * @name LoginController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.login')
        .controller('LoginController', [
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            'userModel',
            '$routeParams',
            function($scope, $window, APIUtils, dataService, userModel, $routeParams){
                $scope.dataService = dataService;
                $scope.host = $scope.dataService.host.replace(/^https?\:\/\//ig, '');

                $scope.tryLogin = function(host, username, password, event){
                    if(event.keyCode === 13){
                        $scope.login(host, username, password);
                    }
                };
                $scope.login = function(host, username, password){
                    $scope.error = false;
                    $scope.server_unreachable = false;

                    if(!username || username == "" ||
                       !password || password == "" ||
                       !host || host == ""
                       ){
                        return false;
                    }else{
                        $scope.dataService.setHost(host);
                        $scope.dataService.setUser(username);
                        userModel.login(username, password, function(status, unreachable){
                            if(status){
                                $scope.$emit('user-logged-in',{});
                                $window.location.hash = '#/overview/server';
                            }else{
                                if(unreachable){
                                   $scope.server_unreachable = true;
                                }else{
                                    $scope.error = true;
                                }
                           };
                        });
                    }
                }
            }
        ]
    );

})(angular);
