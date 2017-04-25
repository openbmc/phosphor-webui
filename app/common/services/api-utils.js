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
              LED_STATE: Constants.LED_STATE,
              LED_STATE_TEXT: Constants.LED_STATE_TEXT,
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
              getLEDState: function(callback){
                $http({
                  method: 'GET',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/led/groups/enclosure_identify",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true
                }).success(function(response){
                      var json = JSON.stringify(response);
                      var content = JSON.parse(json);
                      callback(content.data.Asserted);
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
                      if(error && error.status && error.status == 'error'){
                        callback(error);
                      }else{
                        callback(error, true);
                      }
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
              setLEDState: function(state, callback){
                $http({
                  method: 'PUT',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/led/groups/enclosure_identify/attr/Asserted",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true,
                  data: JSON.stringify({"data": state})
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
              bmcReboot: function(callback){
                $http({
                  method: 'PUT',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/state/bmc0/attr/RequestedBmcTransition",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true,
                  data: JSON.stringify({"data": "xyz.openbmc_project.State.BMC.Transition.Reboot"})
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
              hostPowerOn: function(callback){
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
              },
              getLogs: function(callback){
                $http({
                  method: 'GET',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/logging/enumerate",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true
                }).success(function(response){
                      var json = JSON.stringify(response);
                      var content = JSON.parse(json);
                      var dataClone = JSON.parse(JSON.stringify(content.data));
                      var data = [];
                      var severityCode = '';
                      var priority = '';
                      var resolved = false;
                      var relatedItems = [];

                      for(var key in content.data){
                        if(content.data.hasOwnProperty(key) && content.data[key].hasOwnProperty('Id')){
                          var severityFlags = {low: false, medium: false, high: false};
                          severityCode = content.data[key].Severity.split(".").pop();
                          priority = Constants.SEVERITY_TO_PRIORITY_MAP[severityCode];
                          severityFlags[priority.toLowerCase()] = true;
                          relatedItems = [];
                          content.data[key].associations.forEach(function(item){
                            relatedItems.push(item[2]);
                          });

                          data.push(Object.assign({
                            path: key,
                            copied: false,
                            priority: priority,
                            severity_code: severityCode,
                            severity_flags: severityFlags,
                            additional_data: content.data[key].AdditionalData.join("\n"),
                            selected: false,
                            search_text: ("#" + content.data[key].Id + " " + severityCode + " " + content.data[key].Severity + " " + content.data[key].AdditionalData.join(" ")).toLowerCase(),
                            meta: false,
                            confirm: false,
                            related_items: relatedItems,
                            data: {key: key, value: content.data[key]}
                          }, content.data[key]));
                        }
                      }
                      callback(data, dataClone);
                }).error(function(error){
                  console.log(error);
                });
              }
          };
          return SERVICE;
        }]);

        })(window.angular);
