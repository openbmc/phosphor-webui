window.angular && (function(angular) {
  'use strict';

  /**
   * Status icon Component controller
   */
  const controller = function() {
    this.file;

    /**
     * onChanges Component lifecycle hook
     */
    this.$onChanges = (changes) => {
      // TODO: recompile on changes
      switch (this.status) {
        case 'on':
          this.file = 'icon-on.svg';
          break;
        case 'off':
          this.file = 'icon-off.svg';
          break;
        case 'warn':
          this.file = 'icon-warning.svg';
          break;
        case 'error':
          this.file = 'icon-critical.svg';
          break;
        default:
          break;
      }
    };
  };

  /**
   * Component template
   */
  const template =
      `<icon ng-if="$ctrl.file !== undefined"
             ng-file="{{$ctrl.file}}"
             aria-hidden="true"
             class="status-icon">
        </icon>`

  /**
   * Register statusIcon component
   */
  angular.module('app.common.components')
      .component('statusIcon', {controller, template, bindings: {status: '@'}})
})(window.angular);