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
        'controller': 'loginController'
      })
      .when('/dashboard', {
        'templateUrl': 'dashboard.html',
        'controller': 'dashboardController'
      })
      .when('/power-operations', {
        'templateUrl': 'power-operations.html',
        'controller': 'powerOperationsController'
      })
      .when('/system-overview', {
        'templateUrl': 'system-overview.html',
        'controller': 'systemOverviewController'
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
 .run(['$rootScope', '$location', 'dataService',
    function($rootScope, $location, dataService){
    $rootScope.dataService = dataService;
    dataService.path = $location.path();
    $rootScope.$on('$locationChangeSuccess', function(event){
        var path = $location.path();
        dataService.path = path;
        if(['/','/login','/logout'].indexOf(path) == -1){
            dataService.showNavigation = true;
        }else{
            dataService.showNavigation = false;
        }
    });
    }
 ]);
