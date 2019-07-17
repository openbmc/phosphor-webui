window.angular && (function(angular) {
  'use strict';

  /**
   * Username validator
   *
   * Checks if entered username is a duplicate
   * Provide existingUsernames scope that should be an array of
   * existing usernames
   *
   * <input username-validator  existing-usernames="[]"/>
   *
   */
  angular.module('app.users').directive('usernameValidator', function() {
    return {
      restrict: 'A', require: 'ngModel', scope: {existingUsernames: '='},
          link: function(scope, element, attrs, controller) {
            if (scope.existingUsernames === undefined) {
              return;
            }
            // TODO: only enable validator if field dirty
            const enableValidator = JSON.parse(attrs.usernameValidator);
            controller.$validators.duplicateUsername =
                (modelValue, viewValue) => {
                  const enteredUsername = modelValue || viewValue;
                  const matchedExisting = scope.existingUsernames.find(
                      (username) => username === enteredUsername);
                  if (!enableValidator) {
                    return true;
                  }
                  if (matchedExisting) {
                    return false;
                  } else {
                    return true;
                  }
                };
            element.on('blur', () => {
              controller.$validate();
            });
          }
    }
  });
})(window.angular);
