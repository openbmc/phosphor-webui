 angular
 .module('app.controllers', [])
   .controller('loginController', ['$scope', '$window', 'APIUtils', 'dataService', 'userModel', function($scope, $window, APIUtils, dataService, userModel){
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
            if(userModel.login(username, password)){
                $window.location.hash = '#/system-overview';
            }else{
                $scope.error = true;
            }
        }
    }
 }])
 .controller('dashboardController', ['$scope', 'dataService', function($scope, dataService){
    $scope.dataService = dataService;
 }])
 .controller('systemOverviewController', ['$scope', 'dataService', function($scope, dataService){
    $scope.dataService = dataService;
 }])
 .controller('unitIDController', ['$scope', 'dataService', function($scope, dataService){
    $scope.dataService = dataService;
 }])
 .controller('bmcRebootController', ['$scope', 'dataService', function($scope, dataService){
    $scope.dataService = dataService;
 }])
  .controller('powerOperationsController', ['$scope', 'APIUtils', 'dataService', '$timeout', function($scope, APIUtils, dataService, $timeout){
    $scope.dataService = dataService;
    $scope.confirm = false;
    $scope.power_confirm = false;
    $scope.warmboot_confirm = false;
    $scope.coldboot_confirm = false;
    $scope.orderly_confirm = false;
    $scope.immediately_confirm = false;

    //@TODO: call api and get proper state
    $scope.toggleState = function(){
        dataService.server_state = (dataService.server_state == 'Running') ? 'Off': 'Running';
    }

    $scope.togglePower = function(){
        var method = (dataService.server_state == 'Running') ? 'hostPowerOff' : 'hostPowerOn';
         //@TODO: show progress or set class orange
        APIUtils[method](function(response){
            //update state based on response
            //error case?
            if(response == null){
                console.log("Failed request.");
            }else{
                //@TODO::need to get the server status
                if(dataService.server_state == 'Running'){
                    dataService.setPowerOffState();
                }else{
                    dataService.setPowerOnState();
                }
            }
        });
    }
    $scope.powerOnConfirm = function(){
        if($scope.confirm) {
            return;
        }
        $scope.confirm = true;
        $scope.power_confirm = true;
    };
    $scope.warmReboot = function(){
        //@TODO:show progress
        dataService.loading = true;
        APIUtils.hostPowerOff(function(response){
            if(response){
                dataService.setPowerOffState();
                APIUtils.hostPowerOn(function(response){
                    if(response){
                        dataService.setPowerOnState();
                    }else{
                        //@TODO:show error message
                    }
                    //@TODO:hide progress, set proper server state
                    dataService.loading = false;
                });
            }else{
                //@TODO:hide progress & show error message
                dataService.loading = false;
            }
        });
    };
    $scope.testState = function(){
        //@TODO:show progress
        dataService.loading = true;

        $timeout(function(){
            dataService.setPowerOffState();
            $timeout(function(){
                dataService.setPowerOnState();
                dataService.loading = false;
            }, 2000);
        }, 1000);
    };
    $scope.warmRebootConfirm = function(){
        if($scope.confirm) {
            return;
        }
        $scope.confirm = true;
        $scope.warmboot_confirm = true;
    };

    $scope.coldReboot = function(){
        $scope.warmReboot();
    };
    $scope.coldRebootConfirm = function(){
        if($scope.confirm) {
            return;
        }
        $scope.confirm = true;
        $scope.coldboot_confirm = true;
    };

    $scope.orderlyShutdown = function(){
        //@TODO:show progress
        dataService.loading = true;
        APIUtils.hostPowerOff(function(response){
            if(response){
                dataService.setPowerOffState();
            }else{
                //@TODO:hide progress & show error message
            }
            dataService.loading = false;
        });
    };
    $scope.orderlyShutdownConfirm = function(){
        if($scope.confirm) {
            return;
        }
        $scope.confirm = true;
        $scope.orderly_confirm = true;
    };

    $scope.immediateShutdown = function(){
        $scope.orderlyShutdown();
    };
    $scope.immediateShutdownConfirm = function(){
        if($scope.confirm) {
            return;
        }
        $scope.confirm = true;
        $scope.immediately_confirm = true;
    };
 }]);
