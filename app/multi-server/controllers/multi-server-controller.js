/**
 * Controller for index
 *
 * @module app/multi-server
 * @exports multiServerController
 * @name multiServerController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.overview').controller('multiServerController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
      $scope.customSearch = '';
      $scope.searchTerms = [];
      $scope.loading = false;
      $scope.clear = function() {
        $scope.customSearch = '';
        $scope.searchTerms = [];
      };

      $scope.doSearchOnEnter = function(event) {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (event.keyCode === 13 && search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.doSearchOnClick = function() {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };
      $scope.addServer = function() {
        $scope.multi_server_add = !$scope.multi_server_add;
      };
    }
  ]);
})(angular);
