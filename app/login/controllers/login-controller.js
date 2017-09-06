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
<<<<<<< HEAD
            'userModel',
            '$routeParams',
            function($scope, $window, APIUtils, dataService, userModel, $routeParams){
                $scope.dataService = dataService;

                if($routeParams.fake_login &&
                   $routeParams.fake_login === 'fake_login'){
                    userModel.fakeLogin();
                    $window.location.hash = '#/overview/system';
                }

=======
            'userModel', 
            function($scope, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;

>>>>>>> 4c1a3dd... Major update to code structure
                $scope.tryLogin = function(username, password, event){
                    if(event.keyCode === 13){
                        $scope.login(username, password);
                    }
                }; 
                $scope.login = function(username, password){
                    $scope.error = false;
                    $scope.server_unreachable = false;

                    if(!username || username == "" ||
                       !password || password == ""){
                        return false;
                    }else{
                        userModel.login(username, password, function(status, unreachable){
                            if(status){
                                $scope.$emit('user-logged-in',{});
<<<<<<< HEAD
                                $window.location.hash = '#/overview/system';
=======
                                $window.location.hash = '#/system-overview';
>>>>>>> 4c1a3dd... Major update to code structure
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
