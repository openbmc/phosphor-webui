/**
 * Controller for server LED
 *
 * @module app/serverControl
 * @exports serverLEDController
 * @name serverLEDController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('serverLEDController', [
    '$scope', '$window', '$route', 'APIUtils', 'dataService', 'ngToast',
    function($scope, $window, $route, APIUtils, dataService, ngToast) {
      $scope.dataService = dataService;

      APIUtils.getLEDState().then(function(state) {
        $scope.displayLEDState(state);
      });

      $scope.displayLEDState = function(state) {
        if (state == APIUtils.LED_STATE.on) {
          dataService.LED_state = APIUtils.LED_STATE_TEXT.on;
        } else {
          dataService.LED_state = APIUtils.LED_STATE_TEXT.off;
        }
      };

      $scope.toggleLED = function() {
        var toggleState =
            (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
            APIUtils.LED_STATE.off :
            APIUtils.LED_STATE.on;
        dataService.LED_state =
            (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
            APIUtils.LED_STATE_TEXT.off :
            APIUtils.LED_STATE_TEXT.on;
        APIUtils.setLEDState(toggleState)
            .then(
                function(response) {},
                function(errors) {
                  ngToast.danger(
                      'Failed to turn LED light ' +
                      (toggleState ? 'on' : 'off'));
                  console.log(JSON.stringify(errors));
                  $route.reload();
                })
      };
    }
  ]);
})(angular);
