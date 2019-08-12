window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives')
      .directive('appNavigation', function() {
        return {
          'restrict': 'E',
          'template': require('./app-navigation.html'),
          'scope': {'path': '=', 'showNavigation': '='},
          'controller': [
            '$scope', '$location', 'dataService',
            function($scope, $location, dataService) {
              $scope.dataService = dataService;
              $scope.showSubMenu = false;
              $scope.configuration = false;
              $scope.serverControl = false;
              $scope.change = function(firstLevel) {
                if (firstLevel != $scope.firstLevel) {
                  $scope.firstLevel = firstLevel;
                  $scope.showSubMenu = true;
                } else {
                  $scope.showSubMenu = !$scope.showSubMenu;
                }
              };
              $scope.closeSubnav = function() {
                //   $scope.showSubMenu = false;
              };
              $scope.RedirectToURL = function(destinationURL) {
                $location.url(destinationURL);
              };
              $scope.$watch('path', function() {
                var urlRoot = $location.path().split('/')[1];
                if (urlRoot != '') {
                  $scope.firstLevel = urlRoot;
                } else {
                  $scope.firstLevel = 'overview';
                }
                $scope.showSubMenu = true;
              });
              $scope.$watch('showNavigation', function() {
                var urlRoot = $location.path().split('/')[1];
                if (urlRoot != '') {
                  $scope.firstLevel = urlRoot;
                } else {
                  $scope.firstLevel = 'overview';
                }
              });
            }
          ],
          link: function(scope, element, attributes) {
            var rawNavElement = angular.element(element)[0];
            angular.element(window.document).bind('click', function(event) {
              if (rawNavElement.contains(event.target)) return;

              if (scope.showSubMenu) {
                scope.$apply(function() {
                  scope.showSubMenu = true;
                });
              }
            });
          }
        };
      });
})(window.angular);