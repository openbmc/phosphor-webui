/**
 * Controller for SNMP
 *
 * @module app/configuration
 * @exports snmpController
 * @name snmpController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('snmpController', [
    '$scope', '$window', 'APIUtils',
    function($scope, $window, APIUtils) {
      $scope.managers = {};
      $scope.loading = true;

      var getSNMPManagers = APIUtils.getSNMPManagers().then(
          function(data) {
            $scope.managers = data.data;
          },
          function(error) {
            console.log(JSON.stringify(error));
          });

      getSNMPManagers.finally(function() {
        $scope.loading = false;
      });
    }
  ]);
})(angular);
