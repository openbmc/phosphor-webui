/**
 * Directive for KVM (Kernel-based Virtual Machine)
 *
 * @module app/serverControl
 * @exports kvmConsole
 * @name kvmConsole
 */

import RFB from '@novnc/novnc/core/rfb.js';

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').directive('kvmConsole', [
    '$log', '$location',
    function($log, $location) {
      return {
        restrict: 'E', template: require('./kvm-console.html'),
            link: function(scope, element) {
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
                rfb = new RFB(
                    target, 'wss://' + host + ':' + port + '/kvm/0', {});

                rfb.addEventListener('connect', connected);
                rfb.addEventListener('disconnect', disconnected);
              } catch (exc) {
                $log.error(exc);
                updateState(
                    null, 'fatal', null,
                    'Unable to create RFB client -- ' + exc);
                return;  // don't continue trying to connect
              };
            }
      }
    }
  ]);
})(window.angular);
