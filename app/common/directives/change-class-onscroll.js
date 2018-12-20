window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives')
      .directive('changeClassOnScroll', function($window, $$debounce) {
        return {
          restrict: 'A',
          scope: {offset: '@', scrollClass: '@'},
          link: function(scope, element) {
            function toggle() {
              if (this.pageYOffset >= parseInt(scope.offset)) {
                element.addClass(scope.scrollClass);
              } else {
                element.removeClass(scope.scrollClass);
              }
              scope.$applyAsync();
            }
            angular.element($window).bind('scroll', $$debounce(toggle, 20));
            toggle();
          }
        };
      });
})(window.angular);