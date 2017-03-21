

angular
 .module('app.directives', [])
 .directive('appHeader', ['APIUtils', function(APIUtils){

    return {
        'restrict': 'E',
        'templateUrl': 'header.html',
        'scope': {
            'path': '='
        },
        'controller': ['$rootScope', '$scope','dataService', 'userModel', '$location', function($rootScope, $scope, dataService, userModel, $location){
            $scope.dataService = dataService;

            $scope.loadServerStatus = function(){

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
 }])
  .directive('appNavigation', function(){

    return {
        'restrict': 'E',
        'templateUrl': 'navigation.html',
        'scope': {
            'path': '=',
            'showNavigation': '='
        },
        'controller': ['$scope', 'dataService', function($scope, dataService){
            $scope.$watch('showNavigation', function(){
                var padingTop = 0;
                $scope.firstLevel = 'overview';
                $scope.secondLevel = 'system_overview';
                if($scope.showNavigation){
                    paddingTop = document.getElementById('header__wrapper').offsetHeight;
                }
                dataService.bodyStyle = {'padding-top': paddingTop + 'px'};
                $scope.navStyle = {'top': paddingTop + 'px'};
            });
        }]
    };
 })
  .directive('confirm', ['$timeout', function($timeout){

    return {
        'restrict': 'E',
        'templateUrl': 'confirm.html',
        'scope': {
            'title': '@',
            'message': '@',
            'confirm': '=',
            'callback': '='
        },
        'controller': ['$scope',function($scope){
            $scope.cancel = function(){
                $scope.confirm = false;
                $scope.$parent.confirm = false;
            };
            $scope.accept = function(){
                $scope.callback();
                $scope.cancel();
            }
        }],
        link: function(scope, e) {
            scope.$watch('confirm', function(){
                if(scope.confirm){
                    $timeout(function(){
                        angular.element(e[0].parentNode).css({'min-height': e[0].querySelector('.power__confirm').offsetHeight + 'px'});
                    }, 0);
                }else{
                    angular.element(e[0].parentNode).css({'min-height': 0+ 'px'});
                }
            });
        }
    };
 }]);
