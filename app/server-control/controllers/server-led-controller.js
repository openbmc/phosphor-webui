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
    '$scope',
    '$window',
    'APIUtils',
    'dataService',
    function($scope, $window, APIUtils, dataService) {
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
        const toggleState =
            (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
            APIUtils.LED_STATE.off :
            APIUtils.LED_STATE.on;
        dataService.LED_state =
            (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
            APIUtils.LED_STATE_TEXT.off :
            APIUtils.LED_STATE_TEXT.on;
        APIUtils.setLEDState(toggleState, function(status) {});
      };
    },
  ]);
})(angular);
