/**
 * Directive for KVM (Kernel-based Virtual Machine)
 *
 * @module app/serverControl
 * @exports kvmConsole
 * @name kvmConsole
 */

import KEY from '@novnc/novnc/core/input/keysym.js';
import RFB from '@novnc/novnc/core/rfb.js';

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').directive('kvmConsole', [
    '$log', '$cookies', '$location',
    function($log, $cookies, $location) {
      return {
        restrict: 'E', template: require('./kvm-console.html'),
            scope: {newWindowBtn: '=?'}, link: function(scope, element) {
              var rfb;

              element.on('$destroy', function() {
                if (rfb) {
                  rfb.disconnect();
                }
              });

              function sendCtrlAltDel() {
                rfb.sendCtrlAltDel();
                return false;
              };

              scope.showMacroDropdown = false;
              scope.macroList = [
                'Alt+Tab',       // Switch between the different windows opened
                'Ctrl+Alt+Del',  // Send the Ctrl+Alt+Del key sequence
                'Alt+Space',     // Opens menu option of program
                'Alt+Esc',       // Switch application instantly to different
                'Alt+Enter',     // Opens properties for selected item
                'Print',   // Takes the screen-shot of active window and save it
                'Alt+F4',  // closes opened active window
                'Ctrl+Esc',  // Opens start menu in windows os
                'Ctrl+Tab',  // switch between opened tabs in in browser or
                             // terminal
                'Super+L'
              ];  // log out

              scope.sendMacro =
                  function(macro) {
                scope.showMacroDropdown = false;
                switch (macro) {
                  case 'Alt+Tab':
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', true);
                    rfb.sendKey(KEY.XK_Tab, 'Tab', true);
                    rfb.sendKey(KEY.XK_Tab, 'Tab', false);
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', false);
                    break;

                  case 'Ctrl+Alt+Del':
                    sendCtrlAltDel();
                    break;
                  case 'Alt+Space':
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', true);
                    rfb.sendKey(KEY.XK_space, 'Space', true);
                    rfb.sendKey(KEY.XK_space, 'Space', false);
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', false);
                    break;

                  case 'Alt+Esc':
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', true);
                    rfb.sendKey(KEY.XK_Escape, 'Escape', true);
                    rfb.sendKey(KEY.XK_Escape, 'Escape', false);
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', false);
                    break;

                  case 'Alt+Enter':
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', true);
                    rfb.sendKey(KEY.XK_Return, 'Return', true);
                    rfb.sendKey(KEY.XK_Return, 'Return', false);
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', false);
                    break;

                  case 'Print':
                    rfb.sendKey(KEY.XK_Print, 'Print', true);
                    rfb.sendKey(KEY.XK_Print, 'Print', false);
                    break;

                  case 'Alt+F4':
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', true);
                    rfb.sendKey(KEY.XK_F4, 'F4', true);
                    rfb.sendKey(KEY.XK_F4, 'F4', false);
                    rfb.sendKey(KEY.XK_Alt_L, 'AltLeft', false);
                    break;

                  case 'Ctrl+Esc':
                    rfb.sendKey(KEY.XK_Control_L, 'ControlLeft', true);
                    rfb.sendKey(KEY.XK_Escape, 'Escape', true);
                    rfb.sendKey(KEY.XK_Escape, 'Escape', false);
                    rfb.sendKey(KEY.XK_Control_L, 'ControlLeft', false);
                    break;

                  case 'Ctrl+Tab':
                    rfb.sendKey(KEY.XK_Control_L, 'ControlLeft', true);
                    rfb.sendKey(KEY.XK_Tab, 'Tab', true);
                    rfb.sendKey(KEY.XK_Tab, 'Tab', false);
                    rfb.sendKey(KEY.XK_Control_L, 'ControlLeft', false);
                    break;
                  case 'Super+L':
                    rfb.sendKey(KEY.XK_Super_L, 'SuperLeft', true);
                    rfb.sendKey(KEY.XK_L, 'L', true);
                    rfb.sendKey(KEY.XK_L, 'L', false);
                    rfb.sendKey(KEY.XK_Super_L, 'SuperLeft', false);
                    break;
                  default:
                    console.log('No Macro Pressed');
                }
              }

              function connected(e) {
                $log.debug('RFB Connected');
              }

              function disconnected(e) {
                $log.debug('RFB disconnected');
              }

              var host = $location.host();
              var port = $location.port();
              var target = element[0].firstElementChild;
              try {
                var token = $cookies.get('XSRF-TOKEN');
                rfb = new RFB(
                    target, 'wss://' + host + '/kvm/0',
                    {'wsProtocols': [token]});
                rfb.addEventListener('connect', connected);
                rfb.addEventListener('disconnect', disconnected);
              } catch (exc) {
                $log.error(exc);
                updateState(
                    null, 'fatal', null,
                    'Unable to create RFB client -- ' + exc);
                return;  // don't continue trying to connect
              };

              scope.openWindow = function() {
                window.open(
                    '#/server-control/kvm-window', 'Kvm Window',
                    'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1125,height=900');
              };
            }
      }
    }
  ]);
})(window.angular);
