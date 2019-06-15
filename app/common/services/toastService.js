/**
 * data service
 *
 * @module app/common/services/toastService
 * @exports toastService
 * @name toastService

 */

window.angular &&
  (function(angular) {
    'use strict';

    angular.module('app.common.services').service('toastService', [
      'ngToast',
      '$sce',
      function(ngToast, $sce) {
        this.error = function(message) {
          const errorMessage = $sce.trustAsHtml(
            '<div role="alert"><b>Error</b><br>' + message + '</div>'
          );
          ngToast.create({className: 'danger', content: errorMessage});
        };
        this.success = function(message) {
          const successMessage = $sce.trustAsHtml(
            '<div role="alert"><b>Success!</b><br>' + message + '</div>'
          );
          ngToast.create({className: 'success', content: successMessage});
        };
      },
    ]);
  })(window.angular);
