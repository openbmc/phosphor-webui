

angular
 .module('app.directives', [])
 .directive('appHeader', ['APIUtils', function(APIUtils){

    return {
        'restrict': 'E',
        'templateUrl': 'header.html',
        'scope': {
            'path': '='
        },
        'controller': ['$scope','dataService', 'userModel', '$location', function($scope, dataService, userModel, $location){
            $scope.server_status = 01;
            $scope.dataService = dataService;

            $scope.loadServerStatus = function(){
                $scope.dataService.loading = true;
                APIUtils.login(function(){
                    APIUtils.getHostState(function(status){
                        if(status == 'xyz.openbmc_project.State.Host.HostState.Off'){
                            dataService.setPowerOffState();
                        }else if(status == 'xyz.openbmc_project.State.Host.HostState.Running'){
                            dataService.setPowerOnState();
                        }else{
                            dataService.setBootingState();
                        }
                        dataService.loading = false;
                    });
                });
            }
            $scope.loadServerStatus();

            $scope.logout = function(){
                userModel.logout();
                $location.path('/logout');
            };

            $scope.refresh = function(){
                $scope.loadServerStatus();
            }
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
                var paddingTop = 0;
                $scope.toggle = false;
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
                        angular.element(e[0].parentNode).css({'min-height': e[0].querySelector('.inline__confirm').offsetHeight + 'px'});
                    }, 0);
                }else{
                    angular.element(e[0].parentNode).css({'min-height': 0+ 'px'});
                }
            });
        }
    };
 }]);
