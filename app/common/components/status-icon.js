window.angular && (function(angular) {
  'use strict';

  /**
   * statusIcon Component
   *
   * To use:
   * The <status-icon> component expects a 'status' attribute
   * with a status value (on, off, warn, error)
   *
   */

  /**
   * statusIcon Component template
   */

  const template = `<img  ng-if="$ctrl.status === 'on'"
                          src="../app/assets/icons/icon-on.svg"
                          alt=""
                          class="status-icon">
                    <img ng-if="$ctrl.status === 'off'"
                          src="../app/assets/icons/icon-off.svg"
                          alt=""
                          class="status-icon">
                    <img ng-if="$ctrl.status === 'warn'"
                          src="../app/assets/icons/icon-warning.svg"
                          alt=""
                          class="status-icon">
                    <img ng-if="$ctrl.status === 'error'"
                          src="../app/assets/icons/icon-critical.svg"
                          alt=""
                          class="status-icon">
                    `

  /**
   * Register statusIcon component
   */
  angular.module('app.common.components')
      .component('statusIcon', {template, bindings: {status: '@'}})
})(window.angular);