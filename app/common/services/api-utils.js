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
<<<<<<< HEAD
        .factory('APIUtils', ['$http', 'Constants', '$q', function($http, Constants, $q){
=======
        .factory('APIUtils', ['$http', 'Constants', function($http, Constants){
>>>>>>> 4c1a3dd... Major update to code structure
          var SERVICE = {
              LOGIN_CREDENTIALS: Constants.LOGIN_CREDENTIALS,
              API_CREDENTIALS: Constants.API_CREDENTIALS,
              API_RESPONSE: Constants.API_RESPONSE,
              CHASSIS_POWER_STATE: Constants.CHASSIS_POWER_STATE,
              HOST_STATE_TEXT: Constants.HOST_STATE,
              HOST_STATE: Constants.HOST_STATE,
<<<<<<< HEAD
              LED_STATE: Constants.LED_STATE,
              LED_STATE_TEXT: Constants.LED_STATE_TEXT,
=======
>>>>>>> 4c1a3dd... Major update to code structure
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
<<<<<<< HEAD
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
                      if(callback){
                        callback(content.data.Asserted);
                      }else{
                        return content.data.Asserted;
                      }
                }).error(function(error){
                  console.log(error);
                });
              },
=======
>>>>>>> 4c1a3dd... Major update to code structure
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
<<<<<<< HEAD
                      if(error && error.status && error.status == 'error'){
                        callback(error);
                      }else{
                        callback(error, true);
                      }
=======
                      callback(null, true);
>>>>>>> 4c1a3dd... Major update to code structure
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
<<<<<<< HEAD
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
=======
              hostPowerOn: function(callback){
                /**
                curl -c cjar -b cjar -k -H "Content-Type: application/json" -d 
                "{\"data\": \"xyz.openbmc_project.State.Host.Transition.Off\"}" 
                -X PUT  
                https://9.3.164.147/xyz/openbmc_project/state/host0/attr/RequestedHostTransition 
                **/
>>>>>>> 4c1a3dd... Major update to code structure
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
<<<<<<< HEAD
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
                      if(callback){
                        callback(data, dataClone);
                      }else{
                        return data;
                      }
                }).error(function(error){
                  console.log(error);
                });
              },
              getAllSensorStatus: function(callback){
                $http({
                  method: 'GET',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/sensors/enumerate",
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
                      var severity = {};
                      var title = "";
                      var tempKeyParts = [];
                      var order = 0;

                      function getScaledValue(value, scale){
                        scale = scale + "";
                        var power = parseInt(scale.replace(/[\s\t\+\-]/g,''),10);

                        if(scale.indexOf("+") > -1){
                          value = value * Math.pow(10, power);
                        }else if(scale.indexOf("-") > -1){
                          value = value / Math.pow(10, power);
                        }
                        return value;
                      }

                      function getSensorStatus(reading){
                        var severityFlags = {critical: false, warning: false, normal: false}, severityText = '', order = 0;

                        if(reading.hasOwnProperty('CriticalLow') && 
                          reading.Value < reading.CriticalLow
                          ){
                          severityFlags.critical = true;
                          severityText = 'critical';
                          order = 2;
                        }else if(reading.hasOwnProperty('CriticalHigh') && 
                          reading.Value > reading.CriticalHigh 
                          ){
                          severityFlags.critical = true;
                          severityText = 'critical';
                          order = 2;
                        }else if(reading.hasOwnProperty('CriticalLow') && 
                          reading.hasOwnProperty('WarningLow') && 
                          reading.Value >= reading.CriticalLow && reading.Value <= reading.WarningLow){
                          severityFlags.warning = true;
                          severityText = 'warning';
                          order = 1;
                        }else if(reading.hasOwnProperty('WarningHigh') && 
                          reading.hasOwnProperty('CriticalHigh') && 
                          reading.Value >= reading.WarningHigh && reading.Value <= reading.CriticalHigh){
                          severityFlags.warning = true;
                          severityText = 'warning';
                          order = 1;
                        }else{
                          severityFlags.normal = true;
                          severityText = 'normal';
                        }
                        return { flags: severityFlags, severityText: severityText, order: order};
                      }

                      for(var key in content.data){
                        if(content.data.hasOwnProperty(key) && content.data[key].hasOwnProperty('Unit')){

                          severity = getSensorStatus(content.data[key]);

                          if(!content.data[key].hasOwnProperty('CriticalLow')){
                            content.data[key].CriticalLow = "--";
                            content.data[key].CriticalHigh = "--";
                          }

                          if(!content.data[key].hasOwnProperty('WarningLow')){
                            content.data[key].WarningLow = "--";
                            content.data[key].WarningHigh = "--";
                          }

                          tempKeyParts = key.split("/");
                          title = tempKeyParts.pop();
                          title = tempKeyParts.pop() + '_' + title;
                          title = title.split("_").map(function(item){
                             return item.toLowerCase().charAt(0).toUpperCase() + item.slice(1);
                          }).reduce(function(prev, el){
                            return prev + " " + el;
                          });

                          content.data[key].Value = getScaledValue(content.data[key].Value, content.data[key].Scale);

                          sensorData.push(Object.assign({
                            path: key,
                            selected: false,
                            confirm: false,
                            copied: false,
                            title: title,
                            unit: Constants.SENSOR_UNIT_MAP[content.data[key].Unit],
                            severity_flags: severity.flags,
                            status: severity.severityText,
                            order: severity.order,
                            search_text: (title + " " + content.data[key].Value + " " + 
                               Constants.SENSOR_UNIT_MAP[content.data[key].Unit] + " " + 
                               severity.severityText + " " + 
                               content.data[key].CriticalLow + " " +
                               content.data[key].CriticalHigh + " " +
                               content.data[key].WarningLow + " " +
                               content.data[key].WarningHigh + " "
                               ).toLowerCase(),
                            original_data: {key: key, value: content.data[key]}
                          }, content.data[key]));
                        }
                      }

                      callback(sensorData, dataClone);
                }).error(function(error){
                  console.log(error);
                });
              },
              getFirmwares: function(callback){
                $http({
                  method: 'GET',
                  //url: SERVICE.API_CREDENTIALS.mock_host + "/software",
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/software/enumerate",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true
                }).success(function(response){
                      var json = JSON.stringify(response);
                      var content = JSON.parse(json);
                      var data = [];
                      var active = false;
                      var isExtended = false;
                      var bmcActiveVersion = "";
                      var hostActiveVersion = "";
                      var imageType = "";
                      var extendedVersions = [];

                      function getFormatedExtendedVersions(extendedVersion){
                        var versions = [];
                        extendedVersion = extendedVersion.split(",");

                        extendedVersion.forEach(function(item){
                          var parts = item.split("-");
                          var numberIndex = 0;
                          for(var i = 0; i < parts.length; i++){
                            if(/[0-9]/.test(parts[i])){
                              numberIndex = i;
                              break;
                            }
                          }
                          var titlePart = parts.splice(0, numberIndex);
                          titlePart = titlePart.join("");
                          titlePart = titlePart[0].toUpperCase() + titlePart.substr(1, titlePart.length);
                          var versionPart = parts.join("-");
                          versions.push({
                            title: titlePart,
                            version: versionPart
                          });
                        });

                        return versions;
                      }

                      for(var key in content.data){
                        if(content.data.hasOwnProperty(key) && content.data[key].hasOwnProperty('Version')){
                          active = (/\.Active$/).test(content.data[key].Activation);
                          imageType = content.data[key].Purpose.split(".").pop();
                          isExtended = content.data[key].hasOwnProperty('ExtendedVersion') && content.data[key].ExtendedVersion != "";
                          if(isExtended){
                            extendedVersions = getFormatedExtendedVersions(content.data[key].ExtendedVersion);
                          }
                          data.push(Object.assign({
                            path: key,
                            active: active,
                            imageId: key.split("/").pop(),
                            imageType: imageType,
                            isExtended: isExtended,
                            extended: {
                              show: false,
                              versions: extendedVersions
                            },
                            data: {key: key, value: content.data[key]}
                          }, content.data[key]));

                          if(active && imageType == 'BMC'){
                            bmcActiveVersion = content.data[key].Version;
                          }

                          if(active && imageType == 'Host'){
                            hostActiveVersion = content.data[key].Version;
                          }
                        }
                      }
                      if(callback){
                        callback(data, bmcActiveVersion, hostActiveVersion);
                      }else{
                        return(data, bmcActiveVersion, hostActiveVersion);
                      }
                }).error(function(error){
                  console.log(error);
                });
              },
              uploadImage: function(file, callback){
                $http({
                  method: 'PUT',
                  timeout: 5 * 60 * 1000,
                  //url: 'http://localhost:3002/upload',
                  url: SERVICE.API_CREDENTIALS.host + "/upload/image/",
                  headers: {
                      'Accept': 'application/octet-stream',
                      'Content-Type': 'application/octet-stream'
                  },
                  withCredentials: true,
                  data: file
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
              getBMCEthernetInfo: function(callback){
                $http({
                  method: 'GET',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/inventory/system/chassis/motherboard/boxelder/bmc/ethernet",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true
                }).success(function(response){
                      var json = JSON.stringify(response);
                      var content = JSON.parse(json);
                      if(callback){
                        callback(content.data);
                      }else{
                        return content.data;
                      }
                }).error(function(error){
                  console.log(error);
                });
              },
              getBMCInfo: function(callback){
                $http({
                  method: 'GET',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/inventory/system/chassis/motherboard/boxelder/bmc",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true
                }).success(function(response){
                      var json = JSON.stringify(response);
                      var content = JSON.parse(json);
                      if(callback){
                        callback(content.data);
                      }else{
                        return content.data;
                      }
                }).error(function(error){
                  console.log(error);
                });
              },
              getHardwares: function(callback){
                $http({
                  method: 'GET',
                  url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/inventory/enumerate",
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                  withCredentials: true
                }).success(function(response){
                      var json = JSON.stringify(response);
                      var content = JSON.parse(json);
                      var hardwareData = [];
                      var keyIndexMap = {};
                      var title = "";
                      var data = [];
                      var searchText = "";
                      var componentIndex = -1;
                      var tempParts = [];


                      function isSubComponent(key){

                        for(var i = 0; i < Constants.HARDWARE.parent_components.length; i++){
                          if(key.split(Constants.HARDWARE.parent_components[i]).length == 2) return true;
                        }

                        return false;
                      }

                      function titlelize(title){
                        title = title.replace(/([A-Z0-9]+)/g, " $1").replace(/^\s+/, "");
                        for(var i = 0; i < Constants.HARDWARE.uppercase_titles.length; i++){
                          if(title.toLowerCase().indexOf((Constants.HARDWARE.uppercase_titles[i] + " ")) > -1){
                            return title.toUpperCase();
                          }
                        }

                        return title;
                      }

                      function camelcaseToLabel(obj){
                        var transformed = [], label = "", value = "";
                        for(var key in obj){
                          label = key.replace(/([A-Z0-9]+)/g, " $1").replace(/^\s+/, "");
                          if(obj[key] !== ""){
                            value = obj[key];
                            if(value == 1 || value == 0){
                              value = (value == 1) ? 'Yes' : 'No';
                            }
                            transformed.push({key:label, value: value});
                          }
                        }

                        return transformed;
                      }

                      function getSearchText(data){
                        var searchText = "";
                        for(var i = 0; i < data.length; i++){
                          searchText += " " + data[i].key + " " + data[i].value;
                        }

                        return searchText; 
                      }

                      for(var key in content.data){
                        if(content.data.hasOwnProperty(key) && 
                           key.indexOf(Constants.HARDWARE.component_key_filter) == 0){

                          data = camelcaseToLabel(content.data[key]);
                          searchText = getSearchText(data);
                          title = key.split("/").pop();

                          title = titlelize(title);

                          if(!isSubComponent(key)){
                              hardwareData.push(Object.assign({
                                path: key,
                                title: title,
                                selected: false,
                                expanded: false,
                                search_text: title.toLowerCase() + " " + searchText.toLowerCase(),
                                sub_components: [], 
                                original_data: {key: key, value: content.data[key]}
                              }, {items: data}));

                              keyIndexMap[key] = hardwareData.length - 1;
                          }else{
                            var tempParts = key.split("/");
                            tempParts.pop();
                            tempParts = tempParts.join("/");
                            componentIndex = keyIndexMap[tempParts];
                            data = content.data[key];
                            data.title = title;
                            hardwareData[componentIndex].sub_components.push(data);
                            hardwareData[componentIndex].search_text += " " + title.toLowerCase();
                          }
                      }
                    }

                    if(callback){
                       callback(hardwareData, content.data);
                    }else{
                       return { data: hardwareData, original_data: content.data};
                    }
                });
              },
              deleteLogs: function(logs) {
                  var defer = $q.defer();
                  var promises = [];

                  function finished(){
                      defer.resolve();
                  }

                  logs.forEach(function(item){
                    promises.push($http({
                                      method: 'POST',
                                      url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/logging/entry/"+item.Id+"/action/Delete",
                                      headers: {
                                          'Accept': 'application/json',
                                          'Content-Type': 'application/json'
                                      },
                                      withCredentials: true,
                                      data: JSON.stringify({"data": []})
                                 }));
                  });

                  $q.all(promises).then(finished);

                  return defer.promise;
              },
              resolveLogs: function(logs) {
                  var defer = $q.defer();
                  var promises = [];

                  function finished(){
                      defer.resolve();
                  }

                  logs.forEach(function(item){
                    promises.push($http({
                                      method: 'PUT',
                                      url: SERVICE.API_CREDENTIALS.host + "/xyz/openbmc_project/logging/entry/"+item.Id+"/attr/Resolved",
                                      headers: {
                                          'Accept': 'application/json',
                                          'Content-Type': 'application/json'
                                      },
                                      withCredentials: true,
                                      data: JSON.stringify({"data": "1"})
                                 }));
                  });

                  $q.all(promises).then(finished);

                  return defer.promise;
              },
=======
              }
>>>>>>> 4c1a3dd... Major update to code structure
          };
          return SERVICE;
        }]);

        })(window.angular);
