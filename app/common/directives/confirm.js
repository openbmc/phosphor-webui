window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('confirm', [
    '$timeout',
    function($timeout) {
      return {
        'restrict': 'E',
        'template': require('./confirm.html'),
        'scope':
            {'title': '@', 'message': '@', 'confirm': '=', 'callback': '='},
        'controller': [
          '$scope',
          function($scope) {
            $scope.cancel = function() {
              $scope.confirm = false;
              window.alert('just set confirm to ' + $scope.confirm);
              $scope.$parent.confirm = false;
              $scope.$parent.confirmReboot = false;
              $scope.$parent.confirmShutdown = false;
              window.alert(
                  'just set parent confirm to ' + $scope.$parent.confirm);
            };
            $scope.accept = function() {
              window.alert('if accepted');
              $scope.callback();
              $scope.cancel();
            };
          }
        ]
      };
    }
  ]);
})(window.angular);
