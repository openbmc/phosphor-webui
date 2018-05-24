window.angular && (function(angular) {
  'use strict';

  angular
    .module('app.common.directives')
    .directive('appNavigation', function() {
      return {
        'restrict': 'E',
        'template': require('./app-navigation.html'),
        'scope': {
          'path': '=',
          'showNavigation': '='
        },
        'controller': ['$scope', '$location', 'dataService', function($scope, $location, dataService) {
          $scope.dataService = dataService;
          $scope.showSubMenu = false;
          $scope.change = function(firstLevel) {
            if (firstLevel != $scope.firstLevel) {
              $scope.firstLevel = firstLevel;
              $scope.showSubMenu = true;
            }
            else {
              $scope.showSubMenu = !$scope.showSubMenu;
            }
          };
          $scope.closeSubnav = function() {
            $scope.showSubMenu = false;
          };
          $scope.$watch('path', function() {
            var urlRoot = $location.path().split('/')[1];
            if (urlRoot != '') {
              $scope.firstLevel = urlRoot;
            }
            else {
              $scope.firstLevel = 'overview';
            }
            $scope.showSubMenu = false;
          });
          $scope.$watch('showNavigation', function() {
            var paddingTop = 0;
            var urlRoot = $location.path().split('/')[1];
            if (urlRoot != '') {
              $scope.firstLevel = urlRoot;
            }
            else {
              $scope.firstLevel = 'overview';
            }

            if ($scope.showNavigation) {
              paddingTop = document.getElementById('header__wrapper').offsetHeight;
            }
            dataService.bodyStyle = {
              'padding-top': paddingTop + 'px'
            };
            $scope.navStyle = {
              'top': paddingTop + 'px'
            };
          });
        }],
        link: function(scope, element, attributes) {
          var rawNavElement = angular.element(element)[0];
          angular.element(window.document).bind('click', function(event) {
            if (rawNavElement.contains(event.target))
              return;

            if (scope.showSubMenu) {
              scope.$apply(function() {
                scope.showSubMenu = false;
              });
            }
          });
        }
      };
    });
})(window.angular);
