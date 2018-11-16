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
      .filter(
          'quiescedToError',
          function() {
            return function(state) {
              if (state.toLowerCase() == 'quiesced') {
                return 'Error';
              } else {
                return state;
              }
            }
          })
      .filter('localeDate', function() {
        return function(timestamp, utc = false) {
          var dt = new Date(timestamp);
          if (isNaN(dt)) {
            return 'not available';
          }

          const ro = Intl.DateTimeFormat().resolvedOptions();
          var tz = 'UTC';
          if (!utc) {
              tz = ro.timeZone;
          }

          return dt.toLocaleDateString('en-US', {
              timeZone: tz, month: 'short', year: 'numeric', day: 'numeric'}) +
              ' ' + dt.toLocaleTimeString(ro.lang, {
                  timeZone: tz, timeZoneName: 'short' });
        }
      });
})(window.angular);
