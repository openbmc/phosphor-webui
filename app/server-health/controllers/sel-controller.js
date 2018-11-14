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
          $scope.sysName = '';
          // This string differs with implementations
          $scope.selLogName = 'SEL';

          // TODO: This can be moved to some common place and
          // Get this while starting service.
          function getSysName() {
            // Dynamically get ComputerSystems Name/serial which differs across
            // OEM's
            $scope.loading = true;
            APIUtils.getRedfishSysName().then(
                function(res) {
                  $scope.sysName = res;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                });
          };
          getSysName();

          function loadSELogs() {
            var uri = '/redfish/v1/Systems/' + $scope.sysName +
                '/LogServices/' + $scope.selLogName + '/Entries';
            APIUtils.getAllLogEntries(uri)
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
            // TODO: Add conformation message before clear logs

            var uri = '/redfish/v1/Systems/' + $scope.sysName +
                '/LogServices/' + $scope.selLogName +
                '/Actions/LogService.ClearLog';
            APIUtils.clearLogs(uri)
                .then(function(res) {
                  console.log(JSON.stringify(res));
                })
                .finally(function() {
                  loadSELogs();
                });
          };

          $scope.sort =
              function(keyname) {
            $scope.sortKey = keyname;  // set the sortKey to the param passed
            $scope.reverse =
                !$scope.reverse;  // if true make it false and vice versa
          }

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
