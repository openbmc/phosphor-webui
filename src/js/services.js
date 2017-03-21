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
 .service('apiInterceptor', ['$q', '$rootScope', 'dataService', function($q, $rootScope, dataService){
    return {
        'request': function(config){
            dataService.server_unreachable = false;
            dataService.loading = true;
            return config;
        },
        'response': function(response){
            dataService.loading = false;
            dataService.last_updated = new Date();

            if(response == null){
                dataService.server_unreachable = true;
            }

            if(response && response.status == 'error' &&
               dataService.path != '/login'){
                $rootScope.$emit('timedout-user', {});
            }

            return response;
        },
        'responseError': function(rejection){
            dataService.server_unreachable = true;
            dataService.loading = false;
            return $q.reject(rejection);
        }
    };
 }])
 .service('Constants', function(){
    return {
        LOGIN_CREDENTIALS: {
            username: "test",
            password: "testpass",
        },
        API_CREDENTIALS: {
            host: 'https://9.3.164.147'
        },
        API_RESPONSE: {
            ERROR_STATUS: 'error',
            ERROR_MESSAGE: '401 Unauthorized',
            SUCCESS_STATUS: 'ok',
            SUCCESS_MESSAGE: '200 OK'
        },
        CHASSIS_POWER_STATE: {
            on: 'On',
            off: 'Off'
        },
        HOST_STATE_TEXT: {
            on: 'Running',
            off: 'Off',
            booting: 'Quiesced',
            unreachable: 'Unreachable'
        },
        HOST_STATE: {
            on: 1,
            off: -1,
            booting: 0,
            unreachable: -2
        }
    };
 })
 .service('dataService', ['Constants', function(Constants){
    this.app_version = "openBMC V.0.0.1";
    this.server_health = 'Error';
    this.server_state = 'Unreachable';
    this.server_status = -2;
    this.chassis_state = 'On';
    this.server_id = "Server 9.3.164.147";
    this.last_updated = new Date();

    this.loading = false;
    this.server_unreachable = false;
    this.loading_message = "";
    this.showNavigation = false;
    this.bodyStyle = {};
    this.path = '';

    this.setPowerOnState = function(){
        this.server_state = Constants.HOST_STATE_TEXT.on;
        this.server_status = Constants.HOST_STATE.on;
    },

    this.setPowerOffState = function(){
        this.server_state = Constants.HOST_STATE_TEXT.off;
        this.server_status = Constants.HOST_STATE.off;
    },

    this.setBootingState = function(){
        this.server_state = Constants.HOST_STATE_TEXT.booting;
        this.server_status = Constants.HOST_STATE.booting;
    },

    this.setUnreachableState = function(){
        this.server_state = Constants.HOST_STATE_TEXT.unreachable;
        this.server_status = Constants.HOST_STATE.unreachable;
    }
 }])
 .factory('APIUtils', ['$http', 'Constants', function($http, Constants){
    var SERVICE = {
        LOGIN_CREDENTIALS: Constants.LOGIN_CREDENTIALS,
        API_CREDENTIALS: Constants.API_CREDENTIALS,
        API_RESPONSE: Constants.API_RESPONSE,
        CHASSIS_POWER_STATE: Constants.CHASSIS_POWER_STATE,
        HOST_STATE_TEXT: Constants.HOST_STATE,
        HOST_STATE: Constants.HOST_STATE,
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
        login: function(username, password, callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/login",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": [username, password]})
          }).success(function(response){
            if(callback){
                callback(response);
            }
          }).error(function(error){
            if(callback){
                callback(null, true);
            }
            console.log(error);
          });
        },
        logout: function(callback){
          $http({
            method: 'POST',
            url: SERVICE.API_CREDENTIALS.host + "/logout",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": []})
          }).success(function(response){
            if(callback){
                callback(response);
            }
          }).error(function(error){
            if(callback){
                callback(null, error);
            }
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
          /**
          curl -c cjar -b cjar -k -H "Content-Type: application/json" -d 
          "{\"data\": \"xyz.openbmc_project.State.Host.Transition.Off\"}" 
          -X PUT  
          https://9.3.164.147/xyz/openbmc_project/state/host0/attr/RequestedHostTransition 
          **/
          $http({
            method: 'PUT',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0/attr/RequestedHostTransition",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify({"data": "xyz.openbmc_project.State.Host.Transition.On"})
          }).success(function(response){
                var json = JSON.stringify(response);
                var content = JSON.parse(json);
                if(callback){
                    return callback(content.status);
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
            method: 'PUT',
            url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/host0/attr/RequestedHostTransition",
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
                    return callback(content.status);
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
        login : function(username, password, callback){
            APIUtils.login(username, password, function(response, error){
                if(response && 
                   response.status == APIUtils.API_RESPONSE.SUCCESS_STATUS){
                    sessionStorage.setItem('LOGIN_ID', username);
                    callback(true);
                }else{
                    callback(false, error);
                }
            });
        },
        isLoggedIn : function(){
            if(sessionStorage.getItem('LOGIN_ID') === null){
                return false;
            }
            return true;
        },
        logout : function(callback){
            APIUtils.logout(function(response, error){
                if(response &&
                   response.status == APIUtils.API_RESPONSE.SUCCESS_STATUS){
                    sessionStorage.removeItem('LOGIN_ID');
                    callback(true);
                }else{
                    callback(false, error);
                }
            });
        }
    };
 }]);
