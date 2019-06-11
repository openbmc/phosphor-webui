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
    '$scope', '$location', '$log', 'dataService',
    function($scope, $location, $log, dataService) {
      var rfb;

      $scope.$on('$destroy', function() {
        if (rfb) {
          rfb.disconnect();
        }
      });

      function connected(e) {
        $log.debug('RFB Connected');
      }
      function disconnected(e) {
        $log.debug('RFB disconnected');
      }

      var target =
          angular.element(document.querySelector('#noVNC_container'))[0];

      try {
        rfb = new RFB(target, 'wss://' + dataService.server_id + '/kvm/0', {});

        rfb.addEventListener('connect', connected);
        rfb.addEventListener('disconnect', disconnected);
      } catch (exc) {
        $log.error(exc);
      };
      rfb.clipViewport = true;
      rfb.scaleViewport = true;
      rfb.background = '';

      // Yes, we're poking at an internal novnc interface here, but RFB
      // hardcodes this to flex, which causes us to center on the div top to
      // bottom in comparison to our container.  At least we check that it's
      // there before we poke at it?
      if (rfb._screen !== undefined) {
        rfb._screen.style.display = '';
      }
    }
  ]);
})(angular);
