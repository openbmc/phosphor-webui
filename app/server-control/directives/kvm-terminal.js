import RFB from '@novnc/novnc/core/rfb.js';

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').directive('kvmTerminal', [
    function() {
      return {
        restrict: 'E',
        template: require('./kvm-terminal.html'),
        scope: {newWindowBtn: '=?'},
        controller: [
          '$scope', '$log', '$window', 'dataService',
          function($scope, $log, $window, dataService) {
            let rfb;

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

            let target =
                angular.element(document.querySelector('#noVNC_container'))[0];

            // Creating a new RFB object will start a new connection
            try {
              rfb = new RFB(
                  target, 'wss://' + dataService.server_id + '/kvm/0', {});
              rfb.addEventListener('connect', connected);
              rfb.addEventListener('disconnect', disconnected);
            } catch (exc) {
              $log.error(exc);
            }

            $scope.openWindow = function() {
              if (rfb) {
                rfb.disconnect();
              }
              $window.open(
                  '#/server-control/kvm-window', 'Kvm Window',
                  'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=850');
            };
          }
        ]
      };
    }
  ]);
})(angular);
