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
            function($scope, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;

                $scope.tryLogin = function(username, password, event){
                    if(event.keyCode === 13){
                        $scope.login(username, password);
                    }
                }; 
                $scope.login = function(username, password){
                    $scope.error = false;

                    if(!username || username == "" ||
                       !password || password == ""){
                        return false;
                    }else{
                        userModel.login(username, password, function(status, unreachable){
                            if(status){
                                $scope.$emit('user-logged-in',{});
                                $window.location.hash = '#/system-overview';
                            }else{
                                if(!unreachable){
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
