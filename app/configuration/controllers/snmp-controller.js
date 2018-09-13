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
    '$scope', '$window', 'APIUtils', '$route', '$q',
    function($scope, $window, APIUtils, $route, $q) {
      $scope.managers = {};
      $scope.new_managers = [];
      $scope.loading = true;
      $scope.error = false;
      $scope.success = false;

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

      $scope.addNewSNMPManager = function() {
        $scope.new_managers.push({Address: '', Port: ''});
      };

      $scope.refresh = function() {
        $route.reload();
      };

      $scope.setSNMP = function() {
        $scope.set_time_error = false;
        $scope.set_time_success = false;
        $scope.loading = true;
        var promises = [];

        for (var new_manager of $scope.new_managers) {
          promises.push(addManager(new_manager.Address, new_manager.Port));
        }

        $q.all(promises)
            .then(
                function() {
                  $scope.success = true;
                },
                function(errors) {
                  console.log(JSON.stringify(errors));
                  $scope.error = true;
                })
            .finally(function() {
              $scope.loading = false;
            });
      };

      function addManager(ip, port) {
        return APIUtils.addSNMPManager(ip, port);
      }
    }
  ]);
})(angular);
