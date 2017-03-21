angular
 .module('app', [
    'ngRoute',
    'app.directives',
    'app.services',
    'app.controllers'
 ])
 .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $locationProvider.hashPrefix('');
    $routeProvider
      .when('/login', {
        'templateUrl': 'login.html',
        'controller': 'loginController',
         authenticated: false
      })
      .when('/power-operations', {
        'templateUrl': 'power-operations.html',
        'controller': 'powerOperationsController',
         authenticated: true
      })
      .when('/system-overview', {
        'templateUrl': 'system-overview.html',
        'controller': 'systemOverviewController',
         authenticated: true
      })
      .when('/unit-id', {
        'templateUrl': 'unit-id.html',
        'controller': 'unitIDController',
         authenticated: true
      })
      .when('/bmc-reboot', {
        'templateUrl': 'bmc-reboot.html',
        'controller': 'bmcRebootController',
         authenticated: true
      })
      .otherwise({
        'redirectTo': '/login'
      });
 }])
 .config(['$httpProvider', function($httpProvider){
     //console.log($httpProvider.interceptors);
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
            if(current){
              $location.path(current.$$route.originalPath);
            }else{
              $location.path('/system-overview');
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
