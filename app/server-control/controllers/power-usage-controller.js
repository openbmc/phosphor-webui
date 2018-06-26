/**
 * Controller for power-usage
 *
 * @module app/serverControl
 * @exports powerUsageController
 * @name powerUsageController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('powerUsageController', [
    '$scope', '$window', 'APIUtils', '$route', '$q',
    function($scope, $window, APIUtils, $route, $q) {
      $scope.power_consumption = '';
      $scope.power_cap = {};
      $scope.set_power_cap_error = false;
      $scope.set_power_cap_success = false;
      $scope.loading = false;
      loadPowerData();

      function loadPowerData() {
        $scope.loading = true;

        var getPowerCapPromise = APIUtils.getPowerCap().then(
            function(data) {
              $scope.power_cap = data.data;
              // TODO: openbmc/openbmc#3154 Rest server should return a proper
              // JSON bool. Convert 0/1 to boolean in meantime.
              if ($scope.power_cap.PowerCapEnable) {
                $scope.power_cap.PowerCapEnable = true;
              } else {
                $scope.power_cap.PowerCapEnable = false;
              }
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        var getPowerConsumptionPromise = APIUtils.getPowerConsumption().then(
            function(data) {
              $scope.power_consumption = data;
            },
            function(error) {
              console.log(JSON.stringify(error));
            });

        var promises = [
          getPowerConsumptionPromise,
          getPowerCapPromise,
        ];

        $q.all(promises).finally(function() {
          $scope.loading = false;
        });
      }

      $scope.setPowerCap = function() {
        $scope.set_power_cap_error = false;
        $scope.set_power_cap_success = false;
        // The power cap value will be undefined if outside range
        if (!$scope.power_cap.PowerCap) {
          $scope.set_power_cap_error = true;
          return;
        }
        $scope.loading = true;
        var promises = [
          setPowerCapValue(),
          setPowerCapEnable(),
        ];

        $q.all(promises).finally(function() {
          $scope.loading = false;
          if (!$scope.set_power_cap_error) {
            $scope.set_power_cap_success = true;
          }
        });

      };
      $scope.refresh = function() {
        $route.reload();
      };

      function setPowerCapValue() {
        return APIUtils.setPowerCap($scope.power_cap.PowerCap)
            .then(
                function(data) {},
                function(error) {
                  $scope.set_power_cap_error = true;
                  console.log(JSON.stringify(error));
                });
      }

      function setPowerCapEnable() {
        return APIUtils.setPowerCapEnable($scope.power_cap.PowerCapEnable)
            .then(
                function(data) {},
                function(error) {
                  $scope.set_power_cap_error = true;
                  console.log(JSON.stringify(error));
                });
      }

    }
  ]);

})(angular);
