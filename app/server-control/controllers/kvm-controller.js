/**
 * Controller for KVM (Kernel-based Virtual Machine)
 *
 * @module app/serverControl
 * @exports kvmController
 * @name kvmController
 */

import RFB from '@novnc/novnc/core/rfb.js';

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('kvmController', [
    '$scope', '$location', '$log',
    function($scope, $location, $log) {
      var rfb;

      $scope.$on('$destroy', function() {
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
      var target =
          angular.element(document.querySelector('#noVNC_container'))[0];

      try {
        rfb = new RFB(target, 'wss://' + host + ':' + port + '/kvm/0', {});

        rfb.addEventListener('connect', connected);
        rfb.addEventListener('disconnect', disconnected);
      } catch (exc) {
        $log.error(exc);
        updateState(
            null, 'fatal', null, 'Unable to create RFB client -- ' + exc);
        return;  // don't continue trying to connect
      };
    }
  ]);
})(angular);
