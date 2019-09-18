window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('logFilter', [
    'APIUtils',
    function(APIUtils) {
      return {
        'restrict': 'E',
        'template': require('./log-filter.html'),
        'controller': [
          '$rootScope', '$scope', 'dataService', '$location',
          function($rootScope, $scope, dataService, $location) {
            $scope.dataService = dataService;
            $scope.supportsDateInput = true;

            $scope.toggleSeverityAll = function() {
              $scope.selectedSeverity.all = !$scope.selectedSeverity.all;

              if ($scope.selectedSeverity.all) {
                $scope.selectedSeverity.low = false;
                $scope.selectedSeverity.medium = false;
                $scope.selectedSeverity.high = false;
              }
            };

            $scope.toggleSeverity = function(severity) {
              $scope.selectedSeverity[severity] =
                  !$scope.selectedSeverity[severity];

              if (['high', 'medium', 'low'].indexOf(severity) > -1) {
                if ($scope.selectedSeverity[severity] == false &&
                    (!$scope.selectedSeverity.low &&
                     !$scope.selectedSeverity.medium &&
                     !$scope.selectedSeverity.high)) {
                  $scope.selectedSeverity.all = true;
                  return;
                }
              }

              if ($scope.selectedSeverity.low &&
                  $scope.selectedSeverity.medium &&
                  $scope.selectedSeverity.high) {
                $scope.selectedSeverity.all = true;
                $scope.selectedSeverity.low = false;
                $scope.selectedSeverity.medium = false;
                $scope.selectedSeverity.high = false;
              } else {
                $scope.selectedSeverity.all = false;
              }
            };

            const testDateInputSupport = () => {
              const firstDateInput =
                  document.querySelector('input[type=date]');

              if (firstDateInput && firstDateInput.type == 'text') {
                $scope.supportsDateInput = false;
              }
            };

            testDateInputSupport();
          }
        ]
      };
    }
  ]);
})(window.angular);
