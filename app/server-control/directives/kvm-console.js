/**
 * Directive for KVM (Kernel-based Virtual Machine)
 *
 * @module app/serverControl
 * @exports kvmConsole
 * @name kvmConsole
 */

import KeyTable from "@novnc/novnc/core/input/keysym.js";
import RFB from '@novnc/novnc/core/rfb.js';

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').directive('kvmConsole', [
    '$log', '$cookies', '$location', 'dataService',
    function($log, $cookies, $location, dataService) {
      return {
        restrict: 'E', template: require('./kvm-console.html'),
            scope: {newWindowBtn: '=?'}, link: function(scope, element) {
              var rfb;
              var keysPullDown = [];
              scope.fnsPanelExpanded = false;

              class PressKeyItem {

                constructor(sym, code, keyHandler) {
                  this.sym = sym;
                  this.code = code;
                  this.selected = false;
                }

                unwaitPullDown() {
                  this.pullDown(false);
                }

                waitPullDown() {
                  this.pullDown(true);
                }

                tooglePullUpDown(waitKey) {
                  if (this.selected) {
                    return this.pullUp();
                  }
                  this.pullDown(waitKey);
                }

                pullDown(waitKey) {
                  rfb.sendKey(this.sym, this.code, true);
                  this.selected = true;
                  if (!!waitKey) {
                    keysPullDown.push(this);
                  }
                }

                pullUp() {
                  rfb.sendKey(this.sym, this.code, false);
                  this.selected = false;
                }

                pressKey() {
                  rfb.sendKey(this.sym, this.code);
                  while (keysPullDown.length) {
                    this.pullUp.call(keysPullDown.shift());
                  }
                }
              }

              var flashAllPullDownKeys = function() {
                while (keysPullDown.length) {
                  var key = keysPullDown.shift();
                  key.pullUp.call(key);
                }
              };

              element.on('$destroy', function() {
                if (rfb) {
                  rfb.disconnect();
                }
              });

              scope.sendCtrlAltDel = function() {
                rfb.sendCtrlAltDel();
                console.log("sendCtrlAltDel");
                return false;
              };

              function connected(e) {
                window.addEventListener('keypress', flashAllPullDownKeys);
                $log.debug('RFB Connected');
              }

              function disconnected(e) {
                window.removeEventListener('keypress', flashAllPullDownKeys);
                flashAllPullDownKeys();
                $log.debug('RFB disconnected');
              }

              var host = dataService.getUriHost().hostname;
              var port = dataService.getUriHost().port;
              var target = element[0].firstElementChild;
              try {
                var token = $cookies.get('XSRF-TOKEN');
                rfb = new RFB(
                    target, 'wss://' + host + ":" + port + '/kvm/0',
                    {'wsProtocols': [token]});
                rfb.addEventListener('connect', connected);
                rfb.addEventListener('disconnect', disconnected);
              } catch (exc) {
                $log.error(exc);
                updateState(
                    null, 'fatal', null,
                    'Unable to create RFB client -- ' + exc);
                return;  // don't continue trying to connect
              }

              scope.controlKeys = {
                Ctrl: new PressKeyItem(KeyTable.XK_Control_L, "ControlLeft" ),
                Alt: new PressKeyItem(KeyTable.XK_Alt_L, "AltLeft" ),
                Shift: new PressKeyItem(KeyTable.XK_Shift_L, "ShiftLeft" ),
                Super: new PressKeyItem(KeyTable.XK_Super_L, "Meta" ),
                CapsLock: new PressKeyItem(KeyTable.XK_Caps_Lock, "CapsLock" ),
                NumLock: new PressKeyItem(KeyTable.XK_Num_Lock, "NumLock" ),
              };

              scope.specialKeys = {
                Tab: new PressKeyItem(KeyTable.XK_Tab, "Tab"),
                Escape: new PressKeyItem(KeyTable.XK_Escape, "Escape"),
                Del: new PressKeyItem(KeyTable.XK_Delete, "Delete"),
                Pause: new PressKeyItem(KeyTable.XK_Pause, "Pause"),
              };

              scope.fnsKeys = {
                F1: new PressKeyItem(KeyTable.XK_F1, "F1"),
                F2: new PressKeyItem(KeyTable.XK_F2, "F2"),
                F3: new PressKeyItem(KeyTable.XK_F3, "F3"),
                F4: new PressKeyItem(KeyTable.XK_F4, "F4"),
                F5: new PressKeyItem(KeyTable.XK_F5, "F5"),
                F6: new PressKeyItem(KeyTable.XK_F6, "F6"),
                F7: new PressKeyItem(KeyTable.XK_F7, "F7"),
                F8: new PressKeyItem(KeyTable.XK_F8, "F8"),
                F9: new PressKeyItem(KeyTable.XK_F9, "F9"),
                F10: new PressKeyItem(KeyTable.XK_F10, "F10"),
                F11: new PressKeyItem(KeyTable.XK_F11, "F11"),
                F12: new PressKeyItem(KeyTable.XK_F12, "F12"),
              };

              scope.openWindow = function() {
                window.open(
                    '#/server-control/kvm-window', 'Kvm Window',
                    'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1125,height=900');
              };
            }
      };
    }
  ]);
})(window.angular);
