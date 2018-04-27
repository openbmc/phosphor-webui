window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('appHeader', ['APIUtils', function (APIUtils) {
            return {
                'restrict': 'E',
                'template': require('./app-header.html'),
                'scope': {
                   'path': '='
                },
                'controller': ['$rootScope', '$scope','dataService', 'Constants', 'userModel', '$location', '$route',
                function($rootScope, $scope, dataService, Constants, userModel, $location, $route){
                    $scope.dataService = dataService;

                    // Create a secure websocket with URL as /subscribe
                    // TODO: Need to put in a generic APIUtils to avoid duplicate controller
                    var ws = new WebSocket("wss://" + dataService.server_id + "/subscribe");

                    // Specify the required event details as JSON dictionary
                    var data = JSON.stringify(
                    {
                        "paths": ["/xyz/openbmc_project/state/host0"],
                        "interfaces": ["xyz.openbmc_project.State.Host"]
                    });

                    // Send the JSON dictionary data to host
                    ws.onopen = function() {
                        ws.send(data);
                        console.log("host0 ws opened");
                    };

                    // Close the web socket
                    ws.onclose = function() {
                        console.log("host0 ws closed");
                    };

                    // Websocket event handling function which catches the
                    // current host state
                    ws.onmessage = function (evt) {
                        // Parse the response (JSON dictionary data)
                        var content = JSON.parse(evt.data);

                        // Fetch the current server power state
                        if ( content.hasOwnProperty("properties") &&
                             content['properties'].
                             hasOwnProperty('CurrentHostState') ){
                            var curServerPowerState = null;
                            curServerPowerState =
                                content['properties'].CurrentHostState;
                            // Set the host state and status
                            if (curServerPowerState ==
                                 Constants.HOST_STATE_TEXT.on_code){
                                 dataService.setPowerOnState();
                            }else if(curServerPowerState ==
                                 Constants.HOST_STATE_TEXT.off_code){
                                 dataService.setPowerOffState();
                            }else{
                                 dataService.setErrorState();
                            }
                            $scope.loadServerStatus();
                        }
                    };

                    $scope.loadServerHealth = function(){
                        APIUtils.getLogs().then(function(result){
                            dataService.updateServerHealth(result.data);
                        });
                    }

                    $scope.loadServerStatus = function(){
                        if(!userModel.isLoggedIn()){
                            return;
                        }
                        APIUtils.getHostState().then(function(status){
                            if(status == 'xyz.openbmc_project.State.Host.HostState.Off'){
                                dataService.setPowerOffState();
                            }else if(status == 'xyz.openbmc_project.State.Host.HostState.Running'){
                                dataService.setPowerOnState();
                            }else{
                                dataService.setErrorState();
                            }
                        }, function(error){
                            dataService.activateErrorModal();
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

                    function loadData(){
                       $scope.loadServerStatus();
                       $scope.loadNetworkInfo();
                       $scope.loadServerHealth();
                    }

                    loadData();

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
                        //reload current page controllers and header
                        loadData();
                        $route.reload();
                        //Add flash class to header timestamp on click of refresh
                        var myEl = angular.element( document.querySelector( '.header__refresh' ) );
                        myEl.addClass('flash');
                        setTimeout(function () {
                            myEl.removeClass("flash");
                        },2000);

                    }

                    var loginListener = $rootScope.$on('user-logged-in', function(event, arg){
                        loadData();
                    });

                    $scope.$on('$destroy', function(){
                        loginListener();
                    });

                    $scope.multiRecent = function(){
                        $scope.multi_server_recent = !$scope.multi_server_recent;
                    };
                }]
            };
        }]);
})(window.angular);
