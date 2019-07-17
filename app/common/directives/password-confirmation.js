window.angular && (function(angular) {
  'use strict';

  /**
   * To use, add attribute directive to password confirmation input field
   * with attribute value set to the main password value to check against
   *
   * <input password-confirmation="{{form.password.$modelValue}} name="passwordConfirm">
   *
   */
  angular.module('app.common.directives')
      .directive('passwordConfirm', function() {
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, element, attrs, controller) {
            if(controller === undefined) {
              return;
            }
            controller.$validators.passwordConfirm = (modelValue, viewValue) => {
                const firstPassword = attrs.passwordConfirm;
                const secondPassword = modelValue || viewValue;
                if (firstPassword === secondPassword) {
                  return true;
                } else {
                  return false;
                }
            }
            element.on('keyup', () => {
              controller.$validate();
            })
          }
        };
      });
})(window.angular);
