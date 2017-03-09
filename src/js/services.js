/**
chassis
/org/openbmc/control/chassis0 —> PowerOn ..PowerOff

host reboot
/org/openbmc/control/host0 —>reboot

shutdown
/org/openbmc/control/host0 —> shutdown
**/
angular
 .module('app.services', [])
 .service('dataService', function(){
    this.app_version = "openBMC V.0.0.1";
    this.server_health = 'Error';
    this.server_state = 'On';
    this.chassis_state = 'On';
    this.server_id = "Server BLZ_109284.209.01";
    this.last_updated = new Date();

    this.showNavigation = false;
    this.bodyStyle = {};
    this.path = '';

 })
 .factory('APIUtils', ['$http', function($http){
    var SERVICE = {
        LOGIN_CREDENTIALS: {
            username: "test",
            password: "testpass",
        },
        API_CREDENTIALS: {
            user: 'root',
            password: '0penBmc',
            host: 'https://9.3.164.147'
        },
        CHASSIS_POWER_STATE: {
            on: 'On',
            off: 'Off'
        },
        HOST_STATE: {
            on: 'Running',
            off: 'Off',
            booting: 'Quiesced'
        },
        getChassisState: function(callback){
          $http({
            method: 'GET',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/chassis0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                callback(content.data.CurrentPowerState);
          }).error(function(error){
            console.log(error);
          });
        },
        getHostState: function(callback){
          $http({
            method: 'GET',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                callback(content.data.CurrentHostState);
          }).error(function(error){
            console.log(error);
          });
        },
        login: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/login",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": [SERVICE.API_CREDENTIALS.user, SERVICE.API_CREDENTIALS.password]})
          }).success(function(response){
            if(callback){
                callback(response);
            }
          }).error(function(error){
            console.log(error);
          });
        },
        chassisPowerOn: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": []})
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                if(callback){
                    return callback(content.data.CurrentPowerState);
                }
          }).error(function(error){
            if(callback){
                callback(error);
            }else{
                console.log(error);
            }
          });
        },
        chassisPowerOff: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": []})
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                if(callback){
                    return callback(content.data.CurrentPowerState);
                }
          }).error(function(error){
            if(callback){
                callback(error);
            }else{
                console.log(error);
            }
          });
        },
        hostPowerOn: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "xyz/openbmc_project/state/host0/attr/RequestedHostTransition",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": "xyz.openbmc_project.State.Host.Transition.Off"})
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                if(callback){
                    return callback(content.data.CurrentHostState);
                }
          }).error(function(error){
            if(callback){
                callback(error);
            }else{
                console.log(error);
            }
          });
        },
        hostPowerOff: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": []}),
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                if(callback){
                    return callback(content.data.CurrentHostState);
                }
          }).error(function(error){
            if(callback){
                callback(error);
            }else{
                console.log(error);
            }
          });
        },
        hostReboot: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": []}),
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                if(callback){
                    return callback(content);
                }
          }).error(function(error){
            if(callback){
                callback(error);
            }else{
                console.log(error);
            }
          });
        },
        hostShutdown: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": []})
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                if(callback){
                    return callback(content);
                }
          }).error(function(error){
            if(callback){
                callback(error);
            }else{
                console.log(error);
            }
          });
        }
    };
    return SERVICE;
 }])
 .factory('userModel',['APIUtils',function(APIUtils){
    return {
        login : function(username, password){
            if(username == APIUtils.LOGIN_CREDENTIALS.username &&
               password == APIUtils.LOGIN_CREDENTIALS.password){
                sessionStorage.setItem('LOGIN_ID', username);
                return true;
            }else{
                return false;
            }
        },
        isLoggedIn : function(){
            if(sessionStorage.getItem('LOGIN_ID') === null){
                return false;
            }

            return true;
        },
        logout : function(){
            sessionStorage.removeItem('LOGIN_ID');
            return true;
        }
    };
 }]);
