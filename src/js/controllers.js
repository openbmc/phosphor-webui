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
  .controller('powerOperationsController', ['$scope', 'APIUtils', 'dataService', function($scope, APIUtils, dataService){
    $scope.dataService = dataService;
    $scope.confirm = false;
    $scope.power_confirm = false;
    $scope.warmboot_confirm = false;
    $scope.coldboot_confirm = false;
    $scope.orderly_confirm = false;
    $scope.immediately_confirm = false;

    //@TODO: call api and get proper state
    $scope.toggleState = function(){
        dataService.server_state = (dataService.server_state == 'On') ? 'Off': 'On';
    };

    $scope.togglePower = function(){
        var method = (dataService.server_state == 'On') ? 'chassisPowerOff' : 'chassisPowerOn';
         //@TODO: show progress or set class orange
        APIUtils[method](function(response){
            //update state based on response
            //error case?
            if(response == null){
                console.log("Failed request.");
            }else{
                dataService.server_state = response;
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
        APIUtils.hostPowerOff(function(response){
            if(response){
                APIUtils.hostPowerOn(function(response){
                    if(response){

                    }else{
                        //@TODO:show error message
                    }
                    //@TODO:hide progress, set proper server state
                });
            }else{
                //@TODO:hide progress & show error message
            }
        });
    };
    $scope.warmRebootConfirm = function(){
        if($scope.confirm) {
            return;
        }
        $scope.confirm = true;
        $scope.warmboot_confirm = true;
    };

    $scope.coldReboot = function(){
        //@TODO:show progress
        APIUtils.chassisPowerOff(function(response){
            if(response){
                APIUtils.chassisPowerOn(function(response){
                    if(response){

                    }else{
                        //@TODO:show error message
                    }
                    //@TODO:hide progress, set proper server state
                });
            }else{
                //@TODO:hide progress & show error message
            }
        });
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
        APIUtils.hostPowerOff(function(response){
            if(response){
                APIUtils.chassisPowerOff(function(response){
                    if(response){

                    }else{
                        //@TODO:show error message
                    }
                    //@TODO:hide progress, set proper server state
                });
            }else{
                //@TODO:hide progress & show error message
            }
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
        //@TODO:show progress
        APIUtils.chassisPowerOff(function(response){
            if(response){
                //@TODO: set proper server state
            }else{
                //@TODO:show error message
            }
            //@TODO:hide progress
        });
    };
    $scope.immediateShutdownConfirm = function(){
        if($scope.confirm) {
            return;
        }
        $scope.confirm = true;
        $scope.immediately_confirm = true;
    };
 }]);
