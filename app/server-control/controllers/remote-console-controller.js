/**
 * Controller for server
 *
 * @module app/serverControl
 * @exports remoteConsoleController
 * @name remoteConsoleController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('remoteConsoleController', [
    '$scope', 'dataService', 'APIUtils', 'toastService',
    function($scope, dataService, APIUtils, toastService) {
      $scope.loading = true;
      $scope.SOL_state = APIUtils.SOL_STATE_TEXT.off;
      APIUtils.getSOLState().then(
          function(data) {
            if (data == APIUtils.SOL_STATE.on) {
              $scope.SOL_state = APIUtils.SOL_STATE_TEXT.on;
            } else {
              $scope.SOL_state = APIUtils.SOL_STATE_TEXT.off;
            }
          },
          function(error) {
            console.log(JSON.stringify(error));
          });
      $scope.loading = false;
      $scope.toggleSOL = function() {
        var toggleState = ($scope.SOL_state == APIUtils.SOL_STATE_TEXT.on) ?
            APIUtils.SOL_STATE.off :
            APIUtils.SOL_STATE.on;
        $scope.SOL_state = ($scope.SOL_state == APIUtils.SOL_STATE_TEXT.on) ?
            APIUtils.SOL_STATE_TEXT.off :
            APIUtils.SOL_STATE_TEXT.on;
        APIUtils.setSOLState(toggleState).then(function(error) {
          console.log(JSON.stringify(error));
        });
      };
    }
  ]);
})(angular);