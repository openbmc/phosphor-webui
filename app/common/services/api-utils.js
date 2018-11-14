/**
 * API utilities service
 *
 * @module app/common/services/api-utils
 * @exports APIUtils
 * @name APIUtils
 */

window.angular && (function(angular) {
  'use strict';
  angular.module('app.common.services').factory('APIUtils', [
    '$http', 'Constants', '$q', 'dataService', '$interval',
    function($http, Constants, $q, DataService, $interval) {
      var getScaledValue = function(value, scale) {
        scale = scale + '';
        scale = parseInt(scale, 10);
        var power = Math.abs(parseInt(scale, 10));

        if (scale > 0) {
          value = value * Math.pow(10, power);
        } else if (scale < 0) {
          value = value / Math.pow(10, power);
        }
        return value;
      };
      var SERVICE = {
        API_CREDENTIALS: Constants.API_CREDENTIALS,
        API_RESPONSE: Constants.API_RESPONSE,
        CHASSIS_POWER_STATE: Constants.CHASSIS_POWER_STATE,
        HOST_STATE_TEXT: Constants.HOST_STATE,
        HOST_STATE: Constants.HOST_STATE,
        LED_STATE: Constants.LED_STATE,
        LED_STATE_TEXT: Constants.LED_STATE_TEXT,
        HOST_SESSION_STORAGE_KEY: Constants.API_CREDENTIALS.host_storage_key,
        getChassisState: function() {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/state/chassis0/attr/CurrentPowerState',
            withCredentials: true
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content.data);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });
          return deferred.promise;
        },
        validIPV4IP: function(ip) {
          // Checks for [0-255].[0-255].[0-255].[0-255]
          return ip.match(
              /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/);
        },
        getRedfishSysName: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() + '/redfish/v1/Systems',
                   withCredentials: true
                 })
              .then(
                  function(response) {
                    var sysUrl = response.data['Members'][0]['@odata.id'];
                    return sysUrl.split('/').pop(-1);
                  },
                  function(error) {
                    console.log(JSON.stringify(error));
                  });
        },
        getSELogs: function() {
          var uri = '/redfish/v1/Systems/' + DataService.systemName +
              '/LogServices/EventLog/Entries';
          return $http({
                   method: 'GET',
                   url: DataService.getHost() + uri,
                   withCredentials: true
                 })
              .then(
                  function(response) {
                    return response.data['Members'];
                  },
                  function(error) {
                    console.log(JSON.stringify(error));
                  });
        },
        clearSELogs: function(uri) {
          var uri = '/redfish/v1/Systems/' + DataService.systemName +
              '/LogServices/EventLog/Actions/LogService.ClearLog';
          return $http({
            method: 'POST',
            url: DataService.getHost() + uri,
            withCredentials: true
          });
        },
        deleteObject: function(path) {
          return $http({
                   method: 'POST',
                   url: DataService.getHost() + path + '/action/Delete',
                   withCredentials: true,
                   data: JSON.stringify({'data': []})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getHostState: function() {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/state/host0/attr/CurrentHostState',
            withCredentials: true
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content.data);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });
          return deferred.promise;
        },
        getSNMPManagers: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/snmp/manager/enumerate',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        pollHostStatusTillOn: function() {
          var deferred = $q.defer();
          var hostOnTimeout = setTimeout(function() {
            ws.close();
            deferred.reject(new Error(Constants.MESSAGES.POLL.HOST_ON_TIMEOUT));
          }, Constants.TIMEOUT.HOST_ON);

          var ws =
              new WebSocket('wss://' + DataService.server_id + '/subscribe');
          var data = JSON.stringify({
            'paths': ['/xyz/openbmc_project/state/host0'],
            'interfaces': ['xyz.openbmc_project.State.Host']
          });
          ws.onopen = function() {
            ws.send(data);
          };
          ws.onmessage = function(evt) {
            var content = JSON.parse(evt.data);
            var hostState = content.properties.CurrentHostState;
            if (hostState === Constants.HOST_STATE_TEXT.on_code) {
              clearTimeout(hostOnTimeout);
              ws.close();
              deferred.resolve();
            } else if (hostState === Constants.HOST_STATE_TEXT.error_code) {
              clearTimeout(hostOnTimeout);
              ws.close();
              deferred.reject(new Error(Constants.MESSAGES.POLL.HOST_QUIESCED));
            }
          };
        },

        pollHostStatusTilReboot: function() {
          var deferred = $q.defer();
          var onState = Constants.HOST_STATE_TEXT.on_code;
          var offState = Constants.HOST_STATE_TEXT.on_code;
          var hostTimeout;
          var setHostTimeout = function(message, timeout) {
            hostTimeout = setTimeout(function() {
              ws.close();
              deferred.reject(new Error(message));
            }, timeout);
          };
          var ws =
              new WebSocket('wss://' + DataService.server_id + '/subscribe');
          var data = JSON.stringify({
            'paths': ['/xyz/openbmc_project/state/host0'],
            'interfaces': ['xyz.openbmc_project.State.Host']
          });
          ws.onopen = function() {
            ws.send(data);
          };
          setHostTimeout(
              Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT,
              Constants.TIMEOUT.HOST_OFF);
          var pollState = offState;
          ws.onmessage = function(evt) {
            var content = JSON.parse(evt.data);
            var hostState = content.properties.CurrentHostState;
            if (hostState === pollState) {
              if (pollState === offState) {
                clearTimeout(hostTimeout);
                pollState = onState;
                setHostTimeout(
                    Constants.MESSAGES.POLL.HOST_ON_TIMEOUT,
                    Constants.TIMEOUT.HOST_ON);
              }
              if (pollState === onState) {
                clearTimeout(hostTimeout);
                ws.close();
                deferred.resolve();
              }
            } else if (hostState === Constants.HOST_STATE_TEXT.error_code) {
              clearTimeout(hostTimeout);
              ws.close();
              deferred.reject(new Error(Constants.MESSAGES.POLL.HOST_QUIESCED));
            }
          };
        },

        pollHostStatusTillOff: function() {
          var deferred = $q.defer();
          var hostOffTimeout = setTimeout(function() {
            ws.close();
            deferred.reject(
                new Error(Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT));
          }, Constants.TIMEOUT.HOST_OFF);

          var ws =
              new WebSocket('wss://' + DataService.server_id + '/subscribe');
          var data = JSON.stringify({
            'paths': ['/xyz/openbmc_project/state/host0'],
            'interfaces': ['xyz.openbmc_project.State.Host']
          });
          ws.onopen = function() {
            ws.send(data);
          };
          ws.onmessage = function(evt) {
            var content = JSON.parse(evt.data);
            var hostState = content.properties.CurrentHostState;
            if (hostState === Constants.HOST_STATE_TEXT.off_code) {
              clearTimeout(hostOffTimeout);
              ws.close();
              deferred.resolve();
            }
          };
        },
        addSNMPManager: function(address, port) {
          return $http({
                   method: 'POST',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/snmp/manager/action/Client',
                   withCredentials: true,
                   data: JSON.stringify({'data': [address, +port]})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setSNMPManagerPort: function(snmpManagerPath, port) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() + snmpManagerPath + '/attr/Port',
                   withCredentials: true,
                   data: JSON.stringify({'data': +port})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setSNMPManagerAddress: function(snmpManagerPath, address) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() + snmpManagerPath +
                       '/attr/Address',
                   withCredentials: true,
                   data: JSON.stringify({'data': address})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getNetworkInfo: function() {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/network/enumerate',
            withCredentials: true
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    var hostname = '';
                    var defaultgateway = '';
                    var macAddress = '';

                    function parseNetworkData(content) {
                      var data = {
                        interface_ids: [],
                        interfaces: {},
                        ip_addresses: {ipv4: [], ipv6: []},
                      };
                      var interfaceId = '', keyParts = [], interfaceHash = '',
                          interfaceType = '';
                      for (var key in content.data) {
                        if (key.match(/network\/eth\d+(_\d+)?$/ig)) {
                          interfaceId = key.split('/').pop();
                          if (data.interface_ids.indexOf(interfaceId) == -1) {
                            data.interface_ids.push(interfaceId);
                            data.interfaces[interfaceId] = {
                              interfaceIname: '',
                              DomainName: '',
                              MACAddress: '',
                              Nameservers: [],
                              DHCPEnabled: 0,
                              ipv4: {ids: [], values: []},
                              ipv6: {ids: [], values: []}
                            };
                            data.interfaces[interfaceId].MACAddress =
                                content.data[key].MACAddress;
                            data.interfaces[interfaceId].DomainName =
                                content.data[key].DomainName.join(' ');
                            data.interfaces[interfaceId].Nameservers =
                                content.data[key].Nameservers;
                            data.interfaces[interfaceId].DHCPEnabled =
                                content.data[key].DHCPEnabled;
                          }
                        } else if (
                            key.match(
                                /network\/eth\d+(_\d+)?\/ipv[4|6]\/[a-z0-9]+$/ig)) {
                          keyParts = key.split('/');
                          interfaceHash = keyParts.pop();
                          interfaceType = keyParts.pop();
                          interfaceId = keyParts.pop();

                          if (data.interfaces[interfaceId][interfaceType]
                                  .ids.indexOf(interfaceHash) == -1) {
                            data.interfaces[interfaceId][interfaceType]
                                .ids.push(interfaceHash);
                            data.interfaces[interfaceId][interfaceType]
                                .values.push(content.data[key]);
                            data.ip_addresses[interfaceType].push(
                                content.data[key]['Address']);
                          }
                        }
                      }
                      return data;
                    }

                    if (content.data.hasOwnProperty(
                            '/xyz/openbmc_project/network/config')) {
                      if (content.data['/xyz/openbmc_project/network/config']
                              .hasOwnProperty('HostName')) {
                        hostname =
                            content.data['/xyz/openbmc_project/network/config']
                                .HostName;
                      }
                      if (content.data['/xyz/openbmc_project/network/config']
                              .hasOwnProperty('DefaultGateway')) {
                        defaultgateway =
                            content.data['/xyz/openbmc_project/network/config']
                                .DefaultGateway;
                      }
                    }

                    if (content.data.hasOwnProperty(
                            '/xyz/openbmc_project/network/eth0') &&
                        content.data['/xyz/openbmc_project/network/eth0']
                            .hasOwnProperty('MACAddress')) {
                      macAddress =
                          content.data['/xyz/openbmc_project/network/eth0']
                              .MACAddress;
                    }

                    deferred.resolve({
                      data: content.data,
                      hostname: hostname,
                      defaultgateway: defaultgateway,
                      mac_address: macAddress,
                      formatted_data: parseNetworkData(content)
                    });
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });
          return deferred.promise;
        },
        setMACAddress: function(interface_name, mac_address) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/' + interface_name +
                       '/attr/MACAddress',
                   withCredentials: true,
                   data: JSON.stringify({'data': mac_address})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setDefaultGateway: function(defaultGateway) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/config/attr/DefaultGateway',
                   withCredentials: true,
                   data: JSON.stringify({'data': defaultGateway})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setDHCPEnabled: function(interfaceName, dhcpEnabled) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/' + interfaceName +
                       '/attr/DHCPEnabled',
                   withCredentials: true,
                   data: JSON.stringify({'data': dhcpEnabled})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setNameservers: function(interfaceName, dnsServers) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/' + interfaceName +
                       '/attr/Nameservers',
                   withCredentials: true,
                   data: JSON.stringify({'data': dnsServers})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        deleteIPV4: function(interfaceName, networkID) {
          return $http({
                   method: 'POST',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/' + interfaceName +
                       '/ipv4/' + networkID + '/action/Delete',
                   withCredentials: true,
                   data: JSON.stringify({'data': []})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        addIPV4: function(
            interfaceName, ipAddress, netmaskPrefixLength, gateway) {
          return $http({
                   method: 'POST',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/' + interfaceName +
                       '/action/IP',
                   withCredentials: true,
                   data: JSON.stringify({
                     'data': [
                       'xyz.openbmc_project.Network.IP.Protocol.IPv4',
                       ipAddress, +netmaskPrefixLength, gateway
                     ]
                   })
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getLEDState: function() {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/led/groups/enclosure_identify',
            withCredentials: true
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content.data.Asserted);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });
          return deferred.promise;
        },
        login: function(username, password, callback) {
          $http({
            method: 'POST',
            url: DataService.getHost() + '/login',
            withCredentials: true,
            data: JSON.stringify({'data': [username, password]})
          })
              .then(
                  function(response) {
                    if (callback) {
                      callback(response.data);
                    }
                  },
                  function(error) {
                    if (callback) {
                      if (error && error.status && error.status == 'error') {
                        callback(error);
                      } else {
                        callback(error, true);
                      }
                    }
                    console.log(error);
                  });
        },
        testPassword: function(username, password) {
          // Calls /login without the current session to verify the given
          // password is correct ignore the interceptor logout on a bad password
          return $http({
                   method: 'POST',
                   url: DataService.getHost() + '/login',
                   withCredentials: false,
                   data: JSON.stringify({'data': [username, password]})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        logout: function(callback) {
          $http({
            method: 'POST',
            url: DataService.getHost() + '/logout',
            withCredentials: true,
            data: JSON.stringify({'data': []})
          })
              .then(
                  function(response) {
                    if (callback) {
                      callback(response.data);
                    }
                  },
                  function(error) {
                    if (callback) {
                      callback(null, error);
                    }
                    console.log(error);
                  });
        },
        changePassword: function(user, newPassword) {
          if (DataService.configJson.redfishSupportEnabled) {
            return $http({
              method: 'PATCH',
              url: DataService.getHost() +
                  '/redfish/v1/AccountService/Accounts/' + user,
              withCredentials: true,
              data: JSON.stringify({'Password': newPassword})
            });
          } else {
            var deferred = $q.defer();
            $http({
              method: 'POST',
              url: DataService.getHost() + '/xyz/openbmc_project/user/' + user +
                  '/action/SetPassword',
              withCredentials: true,
              data: JSON.stringify({'data': [newPassword]}),
              responseType: 'arraybuffer'
            })
                .then(
                    function(response, status, headers) {
                      deferred.resolve(
                          {data: response, status: status, headers: headers});
                    },
                    function(error) {
                      console.log(error);
                      deferred.reject(error);
                    });
            return deferred.promise;
          }
        },
        chassisPowerOff: function() {
          var deferred = $q.defer();
          $http({
            method: 'PUT',
            url: DataService.getHost() +
                '/xyz/openbmc_project/state/chassis0/attr/RequestedPowerTransition',
            withCredentials: true,
            data: JSON.stringify(
                {'data': 'xyz.openbmc_project.State.Chassis.Transition.Off'})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content.status);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });
          return deferred.promise;
        },
        setLEDState: function(state, callback) {
          $http({
            method: 'PUT',
            url: DataService.getHost() +
                '/xyz/openbmc_project/led/groups/enclosure_identify/attr/Asserted',
            withCredentials: true,
            data: JSON.stringify({'data': state})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    if (callback) {
                      return callback(content.status);
                    }
                  },
                  function(error) {
                    if (callback) {
                      callback(error);
                    } else {
                      console.log(error);
                    }
                  });
        },
        bmcReboot: function(callback) {
          $http({
            method: 'PUT',
            url: DataService.getHost() +
                '/xyz/openbmc_project/state/bmc0/attr/RequestedBmcTransition',
            withCredentials: true,
            data: JSON.stringify(
                {'data': 'xyz.openbmc_project.State.BMC.Transition.Reboot'})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    if (callback) {
                      return callback(content.status);
                    }
                  },
                  function(error) {
                    if (callback) {
                      callback(error);
                    } else {
                      console.log(error);
                    }
                  });
        },
        getLastRebootTime: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/state/bmc0/attr/LastRebootTime',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        hostPowerOn: function() {
          var deferred = $q.defer();
          $http({
            method: 'PUT',
            url: DataService.getHost() +
                '/xyz/openbmc_project/state/host0/attr/RequestedHostTransition',
            withCredentials: true,
            data: JSON.stringify(
                {'data': 'xyz.openbmc_project.State.Host.Transition.On'})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content.status);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });
          return deferred.promise;
        },
        hostPowerOff: function() {
          var deferred = $q.defer();
          $http({
            method: 'PUT',
            url: DataService.getHost() +
                '/xyz/openbmc_project/state/host0/attr/RequestedHostTransition',
            withCredentials: true,
            data: JSON.stringify(
                {'data': 'xyz.openbmc_project.State.Host.Transition.Off'})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content.status);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });
          return deferred.promise;
        },
        hostReboot: function() {
          var deferred = $q.defer();
          $http({
            method: 'PUT',
            url: DataService.getHost() +
                '/xyz/openbmc_project/state/host0/attr/RequestedHostTransition',
            withCredentials: true,
            data: JSON.stringify(
                {'data': 'xyz.openbmc_project.State.Host.Transition.Reboot'})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content.status);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });

          return deferred.promise;
        },
        hostShutdown: function(callback) {
          $http({
            method: 'POST',
            url: DataService.getHost() + '/xyz/openbmc_project/state/host0',
            withCredentials: true,
            data: JSON.stringify({'data': []})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    if (callback) {
                      return callback(content);
                    }
                  },
                  function(error) {
                    if (callback) {
                      callback(error);
                    } else {
                      console.log(error);
                    }
                  });
        },
        getLastPowerTime: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/state/chassis0/attr/LastStateChangeTime',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getLogs: function() {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/logging/enumerate',
            withCredentials: true
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    var dataClone = JSON.parse(JSON.stringify(content.data));
                    var data = [];
                    var severityCode = '';
                    var priority = '';
                    var health = '';
                    var relatedItems = [];
                    var eventID = 'None';
                    var description = 'None';

                    for (var key in content.data) {
                      if (content.data.hasOwnProperty(key) &&
                          content.data[key].hasOwnProperty('Id')) {
                        var severityFlags = {
                          low: false,
                          medium: false,
                          high: false
                        };
                        severityCode =
                            content.data[key].Severity.split('.').pop();
                        priority =
                            Constants.SEVERITY_TO_PRIORITY_MAP[severityCode];
                        severityFlags[priority.toLowerCase()] = true;
                        relatedItems = [];
                        content.data[key].associations.forEach(function(item) {
                          relatedItems.push(item[2]);
                        });

                        if (content.data[key].hasOwnProperty(['EventID'])) {
                          eventID = content.data[key].EventID;
                        }

                        if (content.data[key].hasOwnProperty(['Description'])) {
                          description = content.data[key].Description;
                        }

                        data.push(Object.assign(
                            {
                              path: key,
                              copied: false,
                              priority: priority,
                              severity_code: severityCode,
                              severity_flags: severityFlags,
                              additional_data:
                                  content.data[key].AdditionalData.join('\n'),
                              type: content.data[key].Message,
                              selected: false,
                              search_text:
                                  ('#' + content.data[key].Id + ' ' +
                                   severityCode + ' ' +
                                   content.data[key].Message + ' ' +
                                   content.data[key].Severity + ' ' +
                                   content.data[key].AdditionalData.join(' '))
                                      .toLowerCase(),
                              meta: false,
                              confirm: false,
                              related_items: relatedItems,
                              eventID: eventID,
                              description: description,
                              data: {key: key, value: content.data[key]}
                            },
                            content.data[key]));
                      }
                    }
                    deferred.resolve({data: data, original: dataClone});
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });

          return deferred.promise;
        },
        getAllSensorStatus: function(callback) {
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/sensors/enumerate',
            withCredentials: true
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    var dataClone = JSON.parse(JSON.stringify(content.data));
                    var sensorData = [];
                    var severity = {};
                    var title = '';
                    var tempKeyParts = [];
                    var order = 0;
                    var customOrder = 0;

                    function getSensorStatus(reading) {
                      var severityFlags = {
                        critical: false,
                        warning: false,
                        normal: false
                      },
                          severityText = '', order = 0;

                      if (reading.hasOwnProperty('CriticalLow') &&
                          reading.Value < reading.CriticalLow) {
                        severityFlags.critical = true;
                        severityText = 'critical';
                        order = 2;
                      } else if (
                          reading.hasOwnProperty('CriticalHigh') &&
                          reading.Value > reading.CriticalHigh) {
                        severityFlags.critical = true;
                        severityText = 'critical';
                        order = 2;
                      } else if (
                          reading.hasOwnProperty('CriticalLow') &&
                          reading.hasOwnProperty('WarningLow') &&
                          reading.Value >= reading.CriticalLow &&
                          reading.Value <= reading.WarningLow) {
                        severityFlags.warning = true;
                        severityText = 'warning';
                        order = 1;
                      } else if (
                          reading.hasOwnProperty('WarningHigh') &&
                          reading.hasOwnProperty('CriticalHigh') &&
                          reading.Value >= reading.WarningHigh &&
                          reading.Value <= reading.CriticalHigh) {
                        severityFlags.warning = true;
                        severityText = 'warning';
                        order = 1;
                      } else {
                        severityFlags.normal = true;
                        severityText = 'normal';
                      }
                      return {
                        flags: severityFlags,
                        severityText: severityText,
                        order: order
                      };
                    }

                    for (var key in content.data) {
                      if (content.data.hasOwnProperty(key) &&
                          content.data[key].hasOwnProperty('Unit')) {
                        severity = getSensorStatus(content.data[key]);

                        if (!content.data[key].hasOwnProperty('CriticalLow')) {
                          content.data[key].CriticalLow = '--';
                          content.data[key].CriticalHigh = '--';
                        }

                        if (!content.data[key].hasOwnProperty('WarningLow')) {
                          content.data[key].WarningLow = '--';
                          content.data[key].WarningHigh = '--';
                        }

                        tempKeyParts = key.split('/');
                        title = tempKeyParts.pop();
                        title = tempKeyParts.pop() + '_' + title;
                        title = title.split('_')
                                    .map(function(item) {
                                      return item.toLowerCase()
                                                 .charAt(0)
                                                 .toUpperCase() +
                                          item.slice(1);
                                    })
                                    .reduce(function(prev, el) {
                                      return prev + ' ' + el;
                                    });

                        content.data[key].Value = getScaledValue(
                            content.data[key].Value, content.data[key].Scale);
                        content.data[key].CriticalLow = getScaledValue(
                            content.data[key].CriticalLow,
                            content.data[key].Scale);
                        content.data[key].CriticalHigh = getScaledValue(
                            content.data[key].CriticalHigh,
                            content.data[key].Scale);
                        content.data[key].WarningLow = getScaledValue(
                            content.data[key].WarningLow,
                            content.data[key].Scale);
                        content.data[key].WarningHigh = getScaledValue(
                            content.data[key].WarningHigh,
                            content.data[key].Scale);
                        if (Constants.SENSOR_SORT_ORDER.indexOf(
                                content.data[key].Unit) > -1) {
                          customOrder = Constants.SENSOR_SORT_ORDER.indexOf(
                              content.data[key].Unit);
                        } else {
                          customOrder = Constants.SENSOR_SORT_ORDER_DEFAULT;
                        }

                        sensorData.push(Object.assign(
                            {
                              path: key,
                              selected: false,
                              confirm: false,
                              copied: false,
                              title: title,
                              unit:
                                  Constants
                                      .SENSOR_UNIT_MAP[content.data[key].Unit],
                              severity_flags: severity.flags,
                              status: severity.severityText,
                              order: severity.order,
                              custom_order: customOrder,
                              search_text:
                                  (title + ' ' + content.data[key].Value + ' ' +
                                   Constants.SENSOR_UNIT_MAP[content.data[key]
                                                                 .Unit] +
                                   ' ' + severity.severityText + ' ' +
                                   content.data[key].CriticalLow + ' ' +
                                   content.data[key].CriticalHigh + ' ' +
                                   content.data[key].WarningLow + ' ' +
                                   content.data[key].WarningHigh + ' ')
                                      .toLowerCase(),
                              original_data:
                                  {key: key, value: content.data[key]}
                            },
                            content.data[key]));
                      }
                    }

                    callback(sensorData, dataClone);
                  },
                  function(error) {
                    console.log(error);
                  });
        },
        getActivation: function(imageId) {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/software/' + imageId +
                       '/attr/Activation',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getFirmwares: function() {
          var deferred = $q.defer();
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/software/enumerate',
            withCredentials: true
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    var data = [];
                    var isExtended = false;
                    var bmcActiveVersion = '';
                    var hostActiveVersion = '';
                    var imageType = '';
                    var extendedVersions = [];
                    var functionalImages = [];

                    function getFormatedExtendedVersions(extendedVersion) {
                      var versions = [];
                      extendedVersion = extendedVersion.split(',');

                      extendedVersion.forEach(function(item) {
                        var parts = item.split('-');
                        var numberIndex = 0;
                        for (var i = 0; i < parts.length; i++) {
                          if (/[0-9]/.test(parts[i])) {
                            numberIndex = i;
                            break;
                          }
                        }
                        var titlePart = parts.splice(0, numberIndex);
                        titlePart = titlePart.join('');
                        titlePart = titlePart[0].toUpperCase() +
                            titlePart.substr(1, titlePart.length);
                        var versionPart = parts.join('-');
                        versions.push({title: titlePart, version: versionPart});
                      });

                      return versions;
                    }

                    // Get the list of functional images so we can compare
                    // later if an image is functional
                    if (content.data[Constants.FIRMWARE.FUNCTIONAL_OBJPATH]) {
                      functionalImages =
                          content.data[Constants.FIRMWARE.FUNCTIONAL_OBJPATH]
                              .endpoints;
                    }
                    for (var key in content.data) {
                      if (content.data.hasOwnProperty(key) &&
                          content.data[key].hasOwnProperty('Version')) {
                        var activationStatus = '';

                        // If the image is "Functional" use that for the
                        // activation status, else use the value of "Activation"
                        // github.com/openbmc/phosphor-dbus-interfaces/blob/master/xyz/openbmc_project/Software/Activation.interface.yaml
                        if (content.data[key].Activation) {
                          activationStatus =
                              content.data[key].Activation.split('.').pop();
                        }

                        if (functionalImages.includes(key)) {
                          activationStatus = 'Functional';
                        }

                        imageType = content.data[key].Purpose.split('.').pop();
                        isExtended = content.data[key].hasOwnProperty(
                                         'ExtendedVersion') &&
                            content.data[key].ExtendedVersion != '';
                        if (isExtended) {
                          extendedVersions = getFormatedExtendedVersions(
                              content.data[key].ExtendedVersion);
                        }
                        data.push(Object.assign(
                            {
                              path: key,
                              activationStatus: activationStatus,
                              imageId: key.split('/').pop(),
                              imageType: imageType,
                              isExtended: isExtended,
                              extended:
                                  {show: false, versions: extendedVersions},
                              data: {key: key, value: content.data[key]}
                            },
                            content.data[key]));

                        if (activationStatus == 'Functional' &&
                            imageType == 'BMC') {
                          bmcActiveVersion = content.data[key].Version;
                        }

                        if (activationStatus == 'Functional' &&
                            imageType == 'Host') {
                          hostActiveVersion = content.data[key].Version;
                        }
                      }
                    }

                    deferred.resolve({
                      data: data,
                      bmcActiveVersion: bmcActiveVersion,
                      hostActiveVersion: hostActiveVersion
                    });
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });

          return deferred.promise;
        },
        changePriority: function(imageId, priority) {
          var deferred = $q.defer();
          $http({
            method: 'PUT',
            url: DataService.getHost() + '/xyz/openbmc_project/software/' +
                imageId + '/attr/Priority',
            withCredentials: true,
            data: JSON.stringify({'data': priority})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });

          return deferred.promise;
        },
        deleteImage: function(imageId) {
          var deferred = $q.defer();
          $http({
            method: 'POST',
            url: DataService.getHost() + '/xyz/openbmc_project/software/' +
                imageId + '/action/Delete',
            withCredentials: true,
            data: JSON.stringify({'data': []})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });

          return deferred.promise;
        },
        activateImage: function(imageId) {
          var deferred = $q.defer();
          $http({
            method: 'PUT',
            url: DataService.getHost() + '/xyz/openbmc_project/software/' +
                imageId + '/attr/RequestedActivation',
            withCredentials: true,
            data:
                JSON.stringify({'data': Constants.FIRMWARE.ACTIVATE_FIRMWARE})
          })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);
                    deferred.resolve(content);
                  },
                  function(error) {
                    console.log(error);
                    deferred.reject(error);
                  });

          return deferred.promise;
        },
        uploadImage: function(file) {
          return $http({
                   method: 'POST',
                   timeout: 5 * 60 * 1000,
                   url: DataService.getHost() + '/upload/image',
                   // Overwrite the default 'application/json' Content-Type
                   headers: {'Content-Type': 'application/octet-stream'},
                   withCredentials: true,
                   data: file
                 })
              .then(function(response) {
                return response.data;
              });
        },
        downloadImage: function(host, filename) {
          return $http({
                   method: 'POST',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/software/action/DownloadViaTFTP',
                   withCredentials: true,
                   data: JSON.stringify({'data': [filename, host]}),
                   responseType: 'arraybuffer'
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getServerInfo: function() {
          // TODO: openbmc/openbmc#3117 Need a way via REST to get
          // interfaces so we can get the system object(s) by the looking
          // for the system interface.
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/inventory/system',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getBMCTime: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() + '/xyz/openbmc_project/time/bmc',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getTime: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/time/enumerate',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        // Even though NTPServers is a network interface specific path
        // (e.g. /xyz/openbmc_project/network/eth0/attr/NTPServers) it acts
        // like a global setting. Just use eth0 for setting and getting the
        // NTP Servers until it is moved to a non-network interface specific
        // path like it is in Redfish. TODO: openbmc/phosphor-time-manager#4
        getNTPServers: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/eth0/attr/NTPServers',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setNTPServers: function(ntpServers) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/eth0/attr/NTPServers',
                   withCredentials: true,
                   data: JSON.stringify({'data': ntpServers})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setTimeMode: function(timeMode) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/time/sync_method/attr/TimeSyncMethod',
                   withCredentials: true,
                   data: JSON.stringify({'data': timeMode})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setTimeOwner: function(timeOwner) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/time/owner/attr/TimeOwner',
                   withCredentials: true,
                   data: JSON.stringify({'data': timeOwner})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setBMCTime: function(time) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/time/bmc/attr/Elapsed',
                   withCredentials: true,
                   data: JSON.stringify({'data': time})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setHostTime: function(time) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/time/host/attr/Elapsed',
                   withCredentials: true,
                   data: JSON.stringify({'data': time})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        getHardwares: function(callback) {
          $http({
            method: 'GET',
            url: DataService.getHost() +
                '/xyz/openbmc_project/inventory/enumerate',
            withCredentials: true
          }).then(function(response) {
            var json = JSON.stringify(response.data);
            var content = JSON.parse(json);
            var hardwareData = [];
            var keyIndexMap = {};
            var title = '';
            var depth = '';
            var data = [];
            var searchText = '';
            var componentIndex = -1;
            var parent = '';

            function isSubComponent(key) {
              for (var i = 0; i < Constants.HARDWARE.parent_components.length;
                   i++) {
                if (key.split(Constants.HARDWARE.parent_components[i]).length ==
                    2)
                  return true;
              }

              return false;
            }

            function titlelize(title) {
              title = title.replace(/([A-Z0-9]+)/g, ' $1').replace(/^\s+/, '');
              for (var i = 0; i < Constants.HARDWARE.uppercase_titles.length;
                   i++) {
                if (title.toLowerCase().indexOf(
                        (Constants.HARDWARE.uppercase_titles[i] + ' ')) > -1) {
                  return title.toUpperCase();
                }
              }

              return title;
            }

            function camelcaseToLabel(obj) {
              var transformed = [], label = '', value = '';
              for (var key in obj) {
                label = key.replace(/([A-Z0-9]+)/g, ' $1').replace(/^\s+/, '');
                if (obj[key] !== '') {
                  value = obj[key];
                  if (value == 1 || value == 0) {
                    value = (value == 1) ? 'Yes' : 'No';
                  }
                  transformed.push({key: label, value: value});
                }
              }

              return transformed;
            }

            function determineParent(key) {
              var levels = key.split('/');
              levels.pop();
              return levels.join('/');
            }

            function getSearchText(data) {
              var searchText = '';
              for (var i = 0; i < data.length; i++) {
                searchText += ' ' + data[i].key + ' ' + data[i].value;
              }

              return searchText;
            }

            for (var key in content.data) {
              if (content.data.hasOwnProperty(key) &&
                  key.indexOf(Constants.HARDWARE.component_key_filter) == 0) {
                data = camelcaseToLabel(content.data[key]);
                searchText = getSearchText(data);
                title = key.split('/').pop();

                title = titlelize(title);
                // e.g. /xyz/openbmc_project/inventory/system and
                // /xyz/openbmc_project/inventory/system/chassis are depths of 5
                // and 6.
                depth = key.split('/').length;
                parent = determineParent(key);

                if (!isSubComponent(key)) {
                  hardwareData.push(Object.assign(
                      {
                        path: key,
                        title: title,
                        depth: depth,
                        parent: parent,
                        selected: false,
                        expanded: false,
                        search_text: title.toLowerCase() + ' ' +
                            searchText.toLowerCase(),
                        sub_components: [],
                        original_data: {key: key, value: content.data[key]}
                      },
                      {items: data}));

                  keyIndexMap[key] = hardwareData.length - 1;
                } else {
                  parent = determineParent(key)
                  componentIndex = keyIndexMap[parent];
                  data = content.data[key];
                  data.title = title;
                  hardwareData[componentIndex].sub_components.push(data);
                  hardwareData[componentIndex].search_text +=
                      ' ' + title.toLowerCase();

                  // Sort the subcomponents alphanumeric so they are displayed
                  // on the inventory page in order (e.g. core 0, core 1, core
                  // 2, ... core 12, core 13)
                  hardwareData[componentIndex].sub_components.sort(function(
                      a, b) {
                    return a.title.localeCompare(
                        b.title, 'en', {numeric: true});
                  });
                }
              }
            }
            // First, order the components by depth and then place the child
            // components beneath their parent component alphanumerically. Can
            // be removed with completion of
            // https://github.com/openbmc/openbmc/issues/3401
            // TODO: Remove this once implemented in back end
            hardwareData.sort(function(a, b) {
              if (a.depth < b.depth) return -1;
              if (a.depth > b.depth) return 1;
              return b.title.localeCompare(a.title, 'en', {numeric: true});
            });

            var orderedComponents = [];

            for (var i = 0; i < hardwareData.length; i++) {
              if (!keyIndexMap[hardwareData[i].parent]) {
                orderedComponents.push(hardwareData[i]);
              } else {
                for (var j = 0; j < orderedComponents.length; j++) {
                  if (orderedComponents[j].path === hardwareData[i].parent) {
                    var child = hardwareData[i];
                    orderedComponents.splice(j + 1, 0, child);
                  }
                }
              }
            }

            if (callback) {
              callback(orderedComponents, content.data);
            } else {
              return {data: orderedComponents, original_data: content.data};
            }
          });
        },
        deleteLogs: function(logs) {
          var defer = $q.defer();
          var promises = [];

          function finished() {
            defer.resolve();
          }

          logs.forEach(function(item) {
            promises.push($http({
              method: 'POST',
              url: DataService.getHost() +
                  '/xyz/openbmc_project/logging/entry/' + item.Id +
                  '/action/Delete',
              withCredentials: true,
              data: JSON.stringify({'data': []})
            }));
          });

          $q.all(promises).then(finished);

          return defer.promise;
        },
        resolveLogs: function(logs) {
          var defer = $q.defer();
          var promises = [];

          function finished() {
            defer.resolve();
          }

          logs.forEach(function(item) {
            promises.push($http({
              method: 'PUT',
              url: DataService.getHost() +
                  '/xyz/openbmc_project/logging/entry/' + item.Id +
                  '/attr/Resolved',
              withCredentials: true,
              data: JSON.stringify({'data': '1'})
            }));
          });

          $q.all(promises).then(finished);

          return defer.promise;
        },
        getPowerConsumption: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/sensors/power/total_power',
                   withCredentials: true
                 })
              .then(
                  function(response) {
                    var json = JSON.stringify(response.data);
                    var content = JSON.parse(json);

                    return getScaledValue(
                               content.data.Value, content.data.Scale) +
                        ' ' +
                        Constants.POWER_CONSUMPTION_TEXT[content.data.Unit];
                  },
                  function(error) {
                    if ('Not Found' == error.statusText) {
                      return Constants.POWER_CONSUMPTION_TEXT.notavailable;
                    } else {
                      throw error;
                    }
                  });
        },
        getPowerCap: function() {
          return $http({
                   method: 'GET',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/control/host0/power_cap',
                   withCredentials: true
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setPowerCapEnable: function(powerCapEnable) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/control/host0/power_cap/attr/PowerCapEnable',
                   withCredentials: true,
                   data: JSON.stringify({'data': powerCapEnable})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setPowerCap: function(powerCap) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/control/host0/power_cap/attr/PowerCap',
                   withCredentials: true,
                   data: JSON.stringify({'data': powerCap})
                 })
              .then(function(response) {
                return response.data;
              });
        },
        setHostname: function(hostname) {
          return $http({
                   method: 'PUT',
                   url: DataService.getHost() +
                       '/xyz/openbmc_project/network/config/attr/HostName',
                   withCredentials: true,
                   data: JSON.stringify({'data': hostname})
                 })
              .then(function(response) {
                return response.data;
              });
        },
      };
      return SERVICE;
    }
  ]);
})(window.angular);
