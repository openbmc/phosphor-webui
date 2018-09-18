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
      $scope.managers = [];
      $scope.loading = true;
      $scope.error = false;
      $scope.success = false;
      $scope.managers_to_delete = [];

      var getSNMPManagers = APIUtils.getSNMPManagers().then(
          function(data) {
            // Convert to array of objects from an object of objects, easier
            // to manipulate (e.g. add/remove). Convert key to a path property.
            for (var key in data.data) {
              $scope.managers.push({
                path: key,
                port: data.data[key].Port,
                update_port: false,
                address: data.data[key].Address,
                update_address: false
              })
            }
          },
          function(error) {
            console.log(JSON.stringify(error));
          });

      getSNMPManagers.finally(function() {
        $scope.loading = false;
      });

      $scope.addNewSNMPManager = function() {
        $scope.managers.push({address: '', port: ''});
      };

      $scope.removeSNMPManager = function(index) {
        // If the SNMP Manager has a path it exists on the backend and we
        // need to make a call to remove it
        if ($scope.managers[index].path) {
          $scope.managers_to_delete.push($scope.managers[index].path);
        }
        $scope.managers.splice(index, 1);
      };

      $scope.refresh = function() {
        $route.reload();
      };

      $scope.setSNMP = function() {
        $scope.error = false;
        $scope.success = false;
        $scope.loading = true;
        var promises = [];

        // Interate in reverse so can splice
        // https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
        var i = $scope.managers.length;
        while (i--) {
          // Remove any SNMP Manager with an empty address and port
          if (!$scope.managers[i].address && !$scope.managers[i].port) {
            $scope.removeSNMPManager(i);
            continue;
          }

          // Throw an error if only 1 of the fields is filled out
          if (!$scope.managers[i].address || !$scope.managers[i].port) {
            // TODO: Highlight the field that is empty
            $scope.loading = false;
            $scope.error = true;
            return;
          }

          // If the manager does not have a 'path', it is a new manager
          // and needs to be created
          if (!$scope.managers[i].path) {
            promises.push(addManager(
                $scope.managers[i].address, $scope.managers[i].port));
          } else {
            if ($scope.managers[i].update_address) {
              promises.push(setManagerAddress(
                  $scope.managers[i].path, $scope.managers[i].address));
            }
            if ($scope.managers[i].update_port) {
              promises.push(setManagerPort(
                  $scope.managers[i].path, $scope.managers[i].port));
            }
          }
        }

        // Add delete promises last since we might be adding to
        // managers_to_delete above
        for (var i in $scope.managers_to_delete) {
          promises.push(deleteManager($scope.managers_to_delete[i]));
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

      function addManager(address, port) {
        return APIUtils.addSNMPManager(address, port);
      }

      function deleteManager(path) {
        return APIUtils.deleteObject(path);
      }

      function setManagerAddress(path, address) {
        return APIUtils.setSNMPManagerAddress(path, address);
      }

      function setManagerPort(path, port) {
        return APIUtils.setSNMPManagerPort(path, port);
      }
    }
  ]);
})(angular);
