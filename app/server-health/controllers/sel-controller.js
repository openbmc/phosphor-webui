/**
 * Controller for log
 *
 * @module app/serverHealth
 * @exports selController
 * @name selController
 */

window.angular && (function(angular) {
  'use strict';
  angular.module('app.serverHealth')
      .config([
        'paginationTemplateProvider',
        function(paginationTemplateProvider) {
          paginationTemplateProvider.setString(
              require('../../common/directives/dirPagination.tpl.html'));
        }
      ])
      .controller('selController', [
        '$scope', 'APIUtils', 'Constants',
        function($scope, APIUtils, Constants) {
          $scope.itemsPerPage = Constants.PAGINATION.LOG_ITEMS_PER_PAGE;
          $scope.loading = true;
          $scope.selLogs = [];
          $scope.customSearch = '';
          $scope.searchTerms = [];
          $scope.sortKey = 'Id';

          function loadSELogs() {
            APIUtils.getSELogs()
                .then(
                    function(res) {
                      $scope.selLogs = res;
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                    })
                .finally(function() {
                  $scope.loading = false;
                });
          };

          $scope.clearSelEntries = function() {
            $scope.confirm = false;
            APIUtils.clearSELogs()
                .then(
                    function(res) {
                      console.log(JSON.stringify(res));
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                    })
                .finally(function() {
                  loadSELogs();
                });
          };

          $scope.sortBy = function(keyname, isReverse) {
            $scope.sortKey = keyname;
            $scope.reverse = isReverse;
          };

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

          $scope.filterBySearchTerms = function(log) {
            if (!$scope.searchTerms.length) return true;

            for (var i = 0, length = $scope.searchTerms.length; i < length;
                 i++) {
              // TODO: Form it while getting data
              var search_text = log.Id + ' ' + log.Name.toLowerCase() + ' ' +
                  log.Message.toLowerCase();
              if (search_text.indexOf($scope.searchTerms[i].toLowerCase()) ==
                  -1)
                return false;
            }
            return true;
          };

          setTimeout(loadSELogs, 2000);
        }
      ]);
})(angular);
