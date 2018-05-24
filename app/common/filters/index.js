window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.filters', [])
      .filter(
          'unResolvedCount',
          function() {
            return function(data) {
              data = data.filter(function(item) {
                return item.Resolved == 0;
              });
              return data.length;
            }
          })
      .filter('quiescedToError', function() {
        return function(state) {
          if (state.toLowerCase() == 'quiesced') {
            return 'Error';
          } else {
            return state;
          }
        }
      });

})(window.angular);
