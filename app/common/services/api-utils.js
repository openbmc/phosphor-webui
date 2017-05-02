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
              },
              getAllSensorStatus: function(callback){
                /**
                GET   https://9.3.185.156/xyz/openbmc_project/sensors/enumerate
                */
                $http({
                  method: 'GET',
                  url: "/assets/mocks/sensors.json",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true
                }).success(function(response){
                      var json = JSON.stringify(response);
                      var content = JSON.parse(json);
                      var dataClone = JSON.parse(JSON.stringify(content.data));
                      var sensorData = [];
                      var allSensorSeveries = [];
                      var allSensorRows = [];
                      var total = 0;
                      var status = 'normal';
                      var data = {
                                   total: 0,
                                   status: '',
                                   sensors: [{
                                      title: 'All Sensors',
                                      type: 'all',
                                      status: '',
                                      severity_flags: {},
                                      search_text: '',
                                      display_headers: ['Sensor (Unit)', 'Reading', 'State'],
                                      data: []
                                   }]
                                 };

                      function getSensorStatus(reading){
                        var severityFlags = {critical: false, warning: false, normal: false}, severityText = '';
                        if(reading.Value >= reading.CriticalLow && reading.Value <= reading.CriticalHigh){
                          severityFlags.critical = true;
                          severityText = 'critical';
                        }
                        else if(reading.Value >= reading.WarningLow && reading.Value <= reading.WarningHigh){
                          severityFlags.warning = true;
                          severityText = 'warning';
                        }else{
                          severityFlags.normal = true;
                          severityText = 'normal';
                        }
                        return { flags: severityFlags, severityText: severityText};
                      }

                      for(var key in content.data){
                        if(content.data.hasOwnProperty(key) && content.data[key].hasOwnProperty('Unit')){
                          sensorData.push(Object.assign({
                            path: key,
                            selected: false,
                            confirm: false,
                            copied: false,
                            original_data: {key: key, value: content.data[key]}
                          }, content.data[key]));
                        }
                      }

                      Constants.SENSOR_DATA_TEMPLATE.sensors.forEach(function(sensor){
                          var rowData = [];
                          var severities = [];
                          var thisSensorData = sensorData.filter(function(el){
                            return el.path.indexOf('sensors/'+sensor.key_search) > -1;
                          });

                          for(var i = 0; i < thisSensorData.length; i++){

                             var severity = getSensorStatus(thisSensorData[i]);
                             severities.push(severity.severityText);
                             rowData.push(Object.assign({
                                title: sensor.sensor_row.title + (i+1),
                                status: severity.severityText,
                                severity_flags: severity.flags,
                                reading: thisSensorData[i].Value + sensor.sensor_row.reading,
                                search_text: (sensor.sensor_row.title + (i+1) + " " + severity.severityText + " " + thisSensorData[i].Value + sensor.sensor_row.reading).toLowerCase(),
                                indicator: (severity.flags.critical) ? '90%' : ((severity.flags.warning) ? '15%' : '50%')
                             }, thisSensorData[i]));
                          }

                          status = (severities.indexOf('critical') > -1) ? 'critical' : ((severities.indexOf('warning') > -1) ? 'warning' : 'normal');
                          total += rowData.length;
                          allSensorSeveries.push(status);
                          var sevFlags =  {critical: false, warning: false, normal: false};
                          sevFlags[status] = true;
                          data.sensors.push({
                            title: sensor.title,
                            type: sensor.type,
                            status: status,
                            severity_flags: sevFlags,
                            search_text: (sensor.title + " " + status).toLowerCase(),
                            display_headers: sensor.display_headers,
                            data: rowData
                          });
                          Array.prototype.push.apply(allSensorRows, rowData);
                      });

                      data.status = (allSensorSeveries.indexOf('critical') > -1) ? 'critical' : ((allSensorSeveries.indexOf('warning') > -1) ? 'warning' : 'normal');
                      data.total = total;
                      if(allSensorRows.length){
                        data.sensors[0].status = data.status;
                        data.sensors[0].data = allSensorRows;
                        data.sensors[0].search_text = (data.sensors[0].title + " " + data.sensors[0].status).toLowerCase();
                        var flags = {critical: false, warning: false, normal: false};
                        flags[data.status] = true;
                        data.sensors[0].severity_flags = flags;
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
