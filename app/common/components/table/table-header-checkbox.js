window.angular && (function(angular) {
  'use strict';

  /**
   * Checkbox directive
   */
  angular.module('app.common.directives').directive('tableHeaderCheckbox', function() {
    return {
      restrict: 'E',
      scope: {model: '<', indeterminate: '=', emitChange: '&'},
      template: `
            <input type="checkbox"
                   ng-model="model"
                   id='test-checkbox'
                   class="bmc-table__checkbox"
                   ng-change="onSelectChange()"/>
          `,
      link: function(scope, element) {
        const inputEl = element.find('input');
        scope.$watch('indeterminate', () => {
          inputEl.prop('indeterminate', scope.indeterminate);
        }, true);
        scope.onSelectChange = () => {
          const checked = scope.model;
          scope.emitChange({checked});
        }
      }
    };
  });
})(window.angular);
