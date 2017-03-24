/**
 * API utilities service
 *
 * @module app/common/services/api-utils
 * @exports APIUtils
 * @name APIUtils
 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';
    angular
        .module('app.common.services')
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
        }]);

        })(window.angular);
