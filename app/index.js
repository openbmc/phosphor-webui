/**
 * A module which contains the definition of the application and the base of configuration
 *
 * @module app/index/services/index
 * @exports app/index
 *
 * @author Developer Developer
 * @version 0.10.0
 * @since 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app', [
            // Dependencies
            'ngRoute',
            // Basic resources
            'app.constants',
            'app.templates',
            'app.vendors',
            'app.common.services',
            'app.common.directives',
            'app.common.filters',
            // Model resources
            'app.login',
            'app.overview'
        ])
        // Route configuration
        .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
            $locationProvider.hashPrefix('');
            $routeProvider
                .otherwise({
                    'redirectTo': '/login'
                });
        }])
        .config(['$httpProvider', function($httpProvider){
            $httpProvider.defaults.timeout = 10000;
            $httpProvider.interceptors.push('apiInterceptor');
        }])
        .run(['$rootScope', '$location', 'dataService', 'userModel',
           function($rootScope, $location, dataService, userModel){
           $rootScope.dataService = dataService;
           dataService.path = $location.path();
           $rootScope.$on('$routeChangeStart', function(event, next, current){

             if(next.$$route == null || next.$$route == undefined) return;
             if(next.$$route.authenticated){
               if(!userModel.isLoggedIn()){
                 $location.path('/login');
               }
             }

             if(next.$$route.originalPath == '/' ||
               next.$$route.originalPath == '/login'){
                if(userModel.isLoggedIn()){
                   if(current && current.$$route){
                     $location.path(current.$$route.originalPath);
                   }else{
                     $location.path('/overview/system');
                   }
                }
             }
           });
           $rootScope.$on('$locationChangeSuccess', function(event){
               var path = $location.path();
               dataService.path = path;
               if(['/','/login','/logout'].indexOf(path) == -1){
                   dataService.showNavigation = true;
               }else{
                   dataService.showNavigation = false;
               }
           });

           $rootScope.$on('timedout-user', function(){
             sessionStorage.removeItem('LOGIN_ID');
             $location.path('/login');
           });
           }
        ]);

})(window.angular);
