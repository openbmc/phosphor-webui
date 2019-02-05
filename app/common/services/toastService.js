/**
 * data service
 *
 * @module app/common/services/toastService
 * @exports toastService
 * @name toastService

 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.services').service('toastService', [
    'ngToast', '$sce',
    function(ngToast, $sce) {
      this.error = function(message) {
        var htmlMessage =
            $sce.trustAsHtml('<div role="alert">' + message + '</div>');
        ngToast.create({className: 'danger', content: htmlMessage});
      };
      this.success = function(message) {
        var htmlMessage =
            $sce.trustAsHtml('<div role="alert">' + message + '</div>');
        ngToast.create({className: 'success', content: htmlMessage});
      };
    }
  ]);
})(window.angular);
