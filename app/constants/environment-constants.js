/**
 * A module with constants for the REST API
 *
 * @module app/constants
 * @exports app/constants
 *
 */

window.angular && (function(angular) {
  'use strict';

  angular
    .module('app.constants')
    .constant('EnvironmentConstants', {
      'inDevelopmentMode': true,
      'RestConstants': {},
      FLASH_MESSAGE: {
        duration: 2000,
        classes: {
          warning: 'message-warning',
          info: 'message-info',
          error: 'message-error',
          success: 'message-success'
        }
      }
    });

})(window.angular);
