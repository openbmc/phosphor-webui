/**
 * Controller for virtual-media
 *
 * @module app/serverControl
 * @exports virtualMediaController
 * @name virtualMediaController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('virtualMediaController', [
    '$scope', 'APIUtils', '$q', 'toastService', 'dataService',
    'nbdServerService', 'virtualMediaModel', '$uibModal',
    function(
        $scope, APIUtils, $q, toastService, dataService, nbdServerService,
        virtualMediaModel, $uibModal) {
      var vms = [];
      $scope.showModal = false;
      const modalTemplate = require('./virtual-media-modal.html');

      $scope.proxyDevices = [];
      $scope.legacyDevices = [];
      APIUtils.getVMCollection().then(
          function(res) {
            vms = res.Members;
            for (let dev in vms) {
              APIUtils.getRedfishObject(dev['@odata.id'])
                  .then(
                      function(res) {
                        if (res.TransferProtocolType == 'OEM') {
                          $scope.proxyDevices.push(createVMDevice(res));
                        } else {
                          $scope.legacyDevices.push(createVMDevice(res));
                        }
                        console.log(
                            'Virtual Media ' + vms[idx]['@odata.id'] +
                            ' device created.');
                      },
                      function(error) {
                        console.log(JSON.stringify(error));
                        toastService.error('Retrieving VM device failed.');
                      });
            }
          },
          function(error) {
            console.log(JSON.stringify(error));
            toastService.error('Retrieving VM collection failed.');
          });

      function createVMDevice(redfishData) {
        var vmDevice = {};
        vmDevice.id = redfishData.Id;
        vmDevice.details = redfishData;
        vmDevice.name = redfishData.Id;
        vmDevice.file = '';
        vmDevice.wsURI = dataService.getHost().replace('https://', 'wss://') +
            redfishData.Oem.WebSocketEndpoint;
        return findExistingConnection(vmDevice);
      }

      $scope.startVM = function(index) {
        var file = $scope.proxyDevices[index].file;
        var id = $scope.proxyDevices[index].id;
        var server =
            new NBDServer($scope.proxyDevices[index].wsURI, file, id, index);
        $scope.proxyDevices[index].nbdServer = server;
        nbdServerService.addConnection(id, server, file);
        server.start();
      };

      $scope.stopVM = function(index) {
        console.log('Stop serving file ' + index.toString());
        var server = $scope.proxyDevices[index].nbdServer;
        server.stop();
      };

      $scope.startLegacy = function(index) {
        console.log(
            'Start serving file ' + index.toString() + ' in legacy mode');
        var data = {};
        data.Image = $scope.legacyDevices[index].Image;
        data.UserName = $scope.legacyDevices[index].UserName;
        data.Password = $scope.legacyDevices[index].Password;
        APIUtils.mountImage(index, data)
            .then(
                function(res) {
                  $scope.legacyDevices[index].isActive = true;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                  $scope.legacyDevices[index].message = error.status;
                });
      };

      $scope.stopLegacy = function(index) {
        APIUtils.unmountImage(index).then(
            function(res) {
              $scope.legacyDevices[index].isActive = false;
            },
            function(error) {
              console.log(JSON.stringify(error));
              $scope.legacyDevices[index].message = error.status;
            });
      };

      const saveConfig = function(configModal) {
        const uri = configModal.uri;
        const usr = configModal.username;
        const pass = configModal.password;
        if (uri != undefined && uri != '' && usr != undefined && usr != '' &&
            pass != undefined && pass != '') {
          var index = $scope.currentIdx;
          $scope.legacyDevices[index].configured = true;
          $scope.legacyDevices[index].Image = uri;
          $scope.legacyDevices[index].UserName = usr;
          $scope.legacyDevices[index].Password = pass;
          virtualMediaModel.saveConfig(
              $scope.legacyDevices[index].id, $scope.legacyDevices[index]);
          console.log('Legacy endpoint configured');
        } else {
          toastService.error('Wrong configuration.');
        }
        console.log('Configured ' + uri);
      };

      const openVMModal = function() {
        $uibModal
            .open({
              template: modalTemplate,
              windowTopClass: 'uib-modal',
              scope: $scope,
              ariaLabelledBy: 'modal-vm'
            })
            .result
            .then(function(config) {
              console.log(config);
              saveConfig(config);
            })
            .catch(function() {
              // do nothing
            });
      };

      $scope.legacyConfigModal = function(index) {
        $scope.currentIdx = index;
        openVMModal();
      };

      function findExistingConnection(vmDevice) {
        if (vmDevice.TransferProtocolType == 'OEM') {
          // Checks with existing connections kept in nbdServerService for an
          // open Websocket connection.
          var existingConnectionsMap =
              nbdServerService.getExistingConnections();
          if (existingConnectionsMap.hasOwnProperty(vmDevice.id)) {
            // Open ws will have a ready state of 1
            if (existingConnectionsMap[vmDevice.id].server.ws.readyState ===
                1) {
              vmDevice.isActive = true;
              vmDevice.file = existingConnectionsMap[vmDevice.id].file;
              vmDevice.nbdServer = existingConnectionsMap[vmDevice.id].server;
            }
          }
        } else {
          var devConfig = virtualMediaModel.getDeviceConfig(vmDevice.id);
          if (devConfig != undefined) {
            vmDevice.configured = true;
            vmDevice.Image = devConfig.Image;
            vmDevice.UserName = devConfig.UserName;
            vmDevice.Password = devConfig.Password;
          }
        }
        return vmDevice;
      }

      /* handshake flags */
      const NBD_FLAG_FIXED_NEWSTYLE = 0x1;
      const NBD_FLAG_NO_ZEROES = 0x2;

      /* transmission flags */
      const NBD_FLAG_HAS_FLAGS = 0x1;
      const NBD_FLAG_READ_ONLY = 0x2;

      /* option negotiation */
      const NBD_OPT_EXPORT_NAME = 0x1;
      const NBD_REP_FLAG_ERROR = 0x1 << 31;
      const NBD_REP_ERR_UNSUP = NBD_REP_FLAG_ERROR | 1;

      /* command definitions */
      const NBD_CMD_READ = 0;
      const NBD_CMD_WRITE = 1;
      const NBD_CMD_DISC = 2;
      const NBD_CMD_TRIM = 4;

      /* errno */
      const EPERM = 1;
      const EIO = 5;
      const EINVAL = 22;
      const ENOSPC = 28;

      /* internal object state */
      const NBD_STATE_UNKNOWN = 1;
      const NBD_STATE_OPEN = 2;
      const NBD_STATE_WAIT_CFLAGS = 3;
      const NBD_STATE_WAIT_OPTION = 4;
      const NBD_STATE_TRANSMISSION = 5;

      class NBDServer {
        constructor(endpoint, file, id, index) {
          this.file = file;
          this.id = id;
          this.endpoint = endpoint;
          this.ws = null;
          this.state = NBD_STATE_UNKNOWN;
          this.msgbuf = null;
          this.index = index;
          this.start = function() {
            this.ws = new WebSocket(this.endpoint);
            this.state = NBD_STATE_OPEN;
            this.ws.binaryType = 'arraybuffer';
            this.ws.onmessage = this._on_ws_message.bind(this);
            this.ws.onopen = this._on_ws_open.bind(this);
            this.ws.onclose = this._on_ws_close.bind(this);
            this.ws.onerror = this._on_ws_error.bind(this);
            $scope.proxyDevices[index].message = 'Server running';
            $scope.proxyDevices[index].isActive = true;
          };
          this.stop = function() {
            this.ws.close();
            this.state = NBD_STATE_UNKNOWN;
          };
          this._on_ws_error = function(ev) {
            $scope.$apply(function() {
              console.log(endpoint + 'error: ' + ev.error);
              $scope.proxyDevices[index].message = 'Error: ' + ev.error;
            });
          };
          this._on_ws_close = function(ev) {
            console.log(`${endpoint} closed with code: ${ev.code} + reason: ${
                ev.reason}`);
            $scope.$apply(function() {
              if (ev.code == 1000) {
                $scope.proxyDevices[index].message =
                    'Server closed successfully';
              } else {
                $scope.proxyDevices[index].message =
                    'Server closed with errors';
                toastService.error(`Server closed with error code ${ev.code}`);
              }
              $scope.proxyDevices[index].isActive = false;
            });
          };
          /* websocket event handlers */
          this._on_ws_open = function(ev) {
            console.log(endpoint + ' opened');
            this.client = {
              flags: 0,
            };
            this._negotiate();
          };
          this._on_ws_message = function(ev) {
            var data = ev.data;
            if (this.msgbuf == null) {
              this.msgbuf = data;
            } else {
              const tmp =
                  new Uint8Array(this.msgbuf.byteLength + data.byteLength);
              tmp.set(new Uint8Array(this.msgbuf), 0);
              tmp.set(new Uint8Array(data), this.msgbuf.byteLength);
              this.msgbuf = tmp.buffer;
            }
            for (;;) {
              var handler = this.recv_handlers[this.state];
              if (!handler) {
                console.log('no handler for state ' + this.state);
                this.stop();
                break;
              }
              var consumed = handler(this.msgbuf);
              if (consumed < 0) {
                console.log(
                    'handler[state=' + this.state + '] returned error ' +
                    consumed);
                this.stop();
                break;
              }
              if (consumed == 0) {
                break;
              }
              if (consumed > 0) {
                if (consumed == this.msgbuf.byteLength) {
                  this.msgbuf = null;
                  break;
                }
                this.msgbuf = this.msgbuf.slice(consumed);
              }
            }
          };
          this._negotiate = function() {
            var buf = new ArrayBuffer(18);
            var data = new DataView(buf, 0, 18);
            /* NBD magic: NBDMAGIC */
            data.setUint32(0, 0x4e42444d);
            data.setUint32(4, 0x41474943);
            /* newstyle negotiation: IHAVEOPT */
            data.setUint32(8, 0x49484156);
            data.setUint32(12, 0x454F5054);
            /* flags: fixed newstyle negotiation, no padding */
            data.setUint16(16, NBD_FLAG_FIXED_NEWSTYLE | NBD_FLAG_NO_ZEROES);
            this.state = NBD_STATE_WAIT_CFLAGS;
            this.ws.send(buf);
          };
          /* handlers */
          this._handle_cflags = function(buf) {
            if (buf.byteLength < 4) {
              return 0;
            }
            var data = new DataView(buf, 0, 4);
            this.client.flags = data.getUint32(0);
            this.state = NBD_STATE_WAIT_OPTION;
            return 4;
          };
          this._handle_option = function(buf) {
            if (buf.byteLength < 16) return 0;
            var data = new DataView(buf, 0, 16);
            if (data.getUint32(0) != 0x49484156 ||
                data.getUint32(4) != 0x454F5054) {
              console.log('invalid option magic');
              return -1;
            }
            var opt = data.getUint32(8);
            var len = data.getUint32(12);
            if (buf.byteLength < 16 + len) {
              return 0;
            }
            switch (opt) {
              case NBD_OPT_EXPORT_NAME:
                var n = 10;
                if (!(this.client.flags & NBD_FLAG_NO_ZEROES)) n += 124;
                var resp = new ArrayBuffer(n);
                var view = new DataView(resp, 0, 10);
                /* export size. */
                var size = this.file.size;
                view.setUint32(0, Math.floor(size / (2 ** 32)));
                view.setUint32(4, size & 0xffffffff);
                /* transmission flags: read-only */
                view.setUint16(8, NBD_FLAG_HAS_FLAGS | NBD_FLAG_READ_ONLY);
                this.ws.send(resp);
                this.state = NBD_STATE_TRANSMISSION;
                break;
              default:
                console.log('handle_option: Unsupported option: ' + opt);
                toastService.error('NBD Server error');
                /* reject other options */
                var resp = new ArrayBuffer(20);
                var view = new DataView(resp, 0, 20);
                view.setUint32(0, 0x0003e889);
                view.setUint32(4, 0x045565a9);
                view.setUint32(8, opt);
                view.setUint32(12, NBD_REP_ERR_UNSUP);
                view.setUint32(16, 0);
                this.ws.send(resp);
            }
            return 16 + len;
          };
          this._create_cmd_response = function(req, rc, data = null) {
            var len = 16;
            if (data) len += data.byteLength;
            var resp = new ArrayBuffer(len);
            var view = new DataView(resp, 0, 16);
            view.setUint32(0, 0x67446698);
            view.setUint32(4, rc);
            view.setUint32(8, req.handle_msB);
            view.setUint32(12, req.handle_lsB);
            if (data) new Uint8Array(resp, 16).set(new Uint8Array(data));
            return resp;
          };
          this._handle_cmd = function(buf) {
            if (buf.byteLength < 28) {
              return 0;
            }
            var view = new DataView(buf, 0, 28);
            if (view.getUint32(0) != 0x25609513) {
              console.log('invalid request magic');
              return -1;
            }
            var req = {
              flags: view.getUint16(4),
              type: view.getUint16(6),
              handle_msB: view.getUint32(8),
              handle_lsB: view.getUint32(12),
              offset_msB: view.getUint32(16),
              offset_lsB: view.getUint32(20),
              length: view.getUint32(24),
            };
            /* we don't support writes, so nothing needs the data at present */
            /* req.data = buf.slice(28); */
            var err = 0;
            var consumed = 28;
            /* the command handlers return 0 on success, and send their
             * own response. Otherwise, a non-zero error code will be
             * used as a simple error response
             */
            switch (req.type) {
              case NBD_CMD_READ:
                err = this._handle_cmd_read(req);
                break;
              case NBD_CMD_DISC:
                err = this._handle_cmd_disconnect(req);
                break;
              case NBD_CMD_WRITE:
                /* we also need length bytes of data to consume a write
                 * request */
                if (buf.byteLength < 28 + req.length) {
                  return 0;
                }
                consumed += req.length;
                err = EPERM;
                break;
              case NBD_CMD_TRIM:
                err = EPERM;
                break;
              default:
                console.log('invalid command 0x' + req.type.toString(16));
                err = EINVAL;
            }
            if (err) {
              console.log('error handle_cmd: ' + err);
              toastService.error('NBD Server error');
              var resp = this._create_cmd_response(req, err);
              this.ws.send(resp);
            }
            return consumed;
          };
          this._handle_cmd_read = function(req) {
            var offset;
            offset = (req.offset_msB * 2 ** 32) + req.offset_lsB;
            if (offset > Number.MAX_SAFE_INTEGER) return ENOSPC;
            if (offset + req.length > Number.MAX_SAFE_INTEGER) return ENOSPC;
            if (offset + req.length > file.size) return ENOSPC;
            var blob = this.file.slice(offset, offset + req.length);
            var reader = new FileReader();
            reader.onload =
                (function(ev) {
                  var reader = ev.target;
                  if (reader.readyState != FileReader.DONE) return;
                  var resp = this._create_cmd_response(req, 0, reader.result);
                  this.ws.send(resp);
                }).bind(this);
            reader.onerror =
                (function(ev) {
                  var reader = ev.target;
                  console.log('error reading file: ' + reader.error);
                  toastService.error('NBD Server error');
                  var resp = this._create_cmd_response(req, EIO);
                  this.ws.send(resp);
                }).bind(this);
            reader.readAsArrayBuffer(blob);
            return 0;
          };
          this._handle_cmd_disconnect = function(req) {
            this.stop();
            return 0;
          };
          this.recv_handlers = Object.freeze({
            [NBD_STATE_WAIT_CFLAGS]: this._handle_cflags.bind(this),
            [NBD_STATE_WAIT_OPTION]: this._handle_option.bind(this),
            [NBD_STATE_TRANSMISSION]: this._handle_cmd.bind(this),
          });
        }
      }
    }
  ]);
})(angular);